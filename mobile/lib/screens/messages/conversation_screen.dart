import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../../core/i18n/locale_provider.dart';
import '../../core/supabase/supabase_service.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_providers.dart';

class ConversationScreen extends ConsumerStatefulWidget {
  const ConversationScreen({super.key, required this.conversationId});
  final String conversationId;

  @override
  ConsumerState<ConversationScreen> createState() =>
      _ConversationScreenState();
}

class _ConversationScreenState extends ConsumerState<ConversationScreen> {
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  RealtimeChannel? _channel;
  bool _loading = true;
  String? _peerName;

  @override
  void initState() {
    super.initState();
    _load();
    _subscribe();
  }

  Future<void> _load() async {
    try {
      final msgs = await SupabaseService.client
          .from('messages')
          .select()
          .eq('conversation_id', widget.conversationId)
          .order('created_at', ascending: true);
      final conv = await SupabaseService.client
          .from('conversations')
          .select(
              '*, buyer:profiles!conversations_buyer_id_fkey(display_name), seller:profiles!conversations_seller_id_fkey(display_name)')
          .eq('id', widget.conversationId)
          .single();
      final user = SupabaseService.currentUser;
      final isBuyer = conv['buyer_id'] == user?.id;
      final other = isBuyer ? conv['seller'] : conv['buyer'];
      if (mounted) {
        setState(() {
          _messages = (msgs as List)
              .map((m) => Map<String, dynamic>.from(m as Map))
              .toList();
          _peerName = (other as Map?)?['display_name'] as String?;
          _loading = false;
        });
      }
      _scrollToBottom();
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _subscribe() {
    _channel = SupabaseService.client
        .channel('messages:${widget.conversationId}')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'messages',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'conversation_id',
            value: widget.conversationId,
          ),
          callback: (payload) {
            final newRow = payload.newRecord;
            if (mounted) {
              setState(() {
                _messages.add(Map<String, dynamic>.from(newRow));
              });
              _scrollToBottom();
            }
          },
        )
        .subscribe();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _send() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    final user = SupabaseService.currentUser;
    if (user == null) return;
    _ctrl.clear();
    try {
      await SupabaseService.client.from('messages').insert({
        'conversation_id': widget.conversationId,
        'sender_id': user.id,
        'content': text,
      });
      await SupabaseService.client.from('conversations').update({
        'updated_at': DateTime.now().toUtc().toIso8601String(),
      }).eq('id', widget.conversationId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  void dispose() {
    _channel?.unsubscribe();
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    return Scaffold(
      appBar: AppBar(title: Text(_peerName ?? context.t('detail.seller'))),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    controller: _scroll,
                    padding: const EdgeInsets.all(12),
                    itemCount: _messages.length,
                    itemBuilder: (context, i) {
                      final msg = _messages[i];
                      final mine = msg['sender_id'] == user?.id;
                      return Align(
                        alignment: mine
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 3),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: mine ? AppColors.primary : AppColors.muted,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(14),
                              topRight: const Radius.circular(14),
                              bottomLeft: Radius.circular(mine ? 14 : 2),
                              bottomRight: Radius.circular(mine ? 2 : 14),
                            ),
                          ),
                          constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.75),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                msg['content'] as String? ?? '',
                                style: TextStyle(
                                  color: mine
                                      ? Colors.white
                                      : AppColors.foreground,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                timeago.format(
                                    DateTime.parse(
                                        msg['created_at'] as String),
                                    locale: 'fr_short'),
                                style: TextStyle(
                                  fontSize: 10,
                                  color: mine
                                      ? Colors.white70
                                      : AppColors.mutedForeground,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      decoration: InputDecoration(
                        hintText: context.t('messages.placeholder'),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  IconButton.filled(
                    onPressed: _send,
                    icon: const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
