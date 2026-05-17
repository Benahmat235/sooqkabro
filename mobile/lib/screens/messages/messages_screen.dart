import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../../core/i18n/locale_provider.dart';
import '../../core/supabase/supabase_service.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_providers.dart';

final conversationsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  final res = await SupabaseService.client
      .from('conversations')
      .select(
          '*, listings(title, listing_images(image_url, position)), buyer:profiles!conversations_buyer_id_fkey(display_name, avatar_url), seller:profiles!conversations_seller_id_fkey(display_name, avatar_url), messages(content, created_at)')
      .or('buyer_id.eq.${user.id},seller_id.eq.${user.id}')
      .order('updated_at', ascending: false);
  return (res as List)
      .map((m) => Map<String, dynamic>.from(m as Map))
      .toList();
});

class MessagesScreen extends ConsumerWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: Text(context.t('messages.title'))),
        body: Center(child: Text(context.t('account.loginPrompt'))),
      );
    }
    final convs = ref.watch(conversationsProvider);
    return Scaffold(
      appBar: AppBar(title: Text(context.t('messages.title'))),
      body: convs.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (data) {
          if (data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(LucideIcons.messageCircle,
                      size: 64, color: AppColors.mutedForeground),
                  const SizedBox(height: 12),
                  Text(context.t('messages.none'),
                      style:
                          const TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(context.t('messages.appear'),
                      style:
                          const TextStyle(color: AppColors.mutedForeground)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(conversationsProvider),
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: data.length,
              separatorBuilder: (_, __) =>
                  const Divider(height: 1, color: AppColors.border),
              itemBuilder: (context, i) {
                final c = data[i];
                final isBuyer = c['buyer_id'] == user.id;
                final other =
                    isBuyer ? (c['seller'] as Map?) : (c['buyer'] as Map?);
                final listing = c['listings'] as Map?;
                final imgs = (listing?['listing_images'] as List?) ?? [];
                final img = imgs.isNotEmpty
                    ? (imgs.first as Map)['image_url'] as String?
                    : null;
                final msgs = (c['messages'] as List?) ?? [];
                final lastMsg = msgs.isNotEmpty
                    ? msgs.last as Map
                    : null;
                return ListTile(
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: SizedBox(
                      width: 48,
                      height: 48,
                      child: img != null
                          ? CachedNetworkImage(
                              imageUrl: img, fit: BoxFit.cover)
                          : Container(
                              color: AppColors.muted,
                              child: const Icon(LucideIcons.image,
                                  color: AppColors.mutedForeground),
                            ),
                    ),
                  ),
                  title: Text(
                    (other?['display_name'] as String?) ??
                        context.t('detail.seller'),
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(
                    (lastMsg?['content'] as String?) ??
                        (listing?['title'] as String? ?? ''),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        color: AppColors.mutedForeground, fontSize: 13),
                  ),
                  trailing: Text(
                    lastMsg != null
                        ? timeago.format(
                            DateTime.parse(lastMsg['created_at'] as String),
                            locale: 'fr_short')
                        : '',
                    style: const TextStyle(
                        color: AppColors.mutedForeground, fontSize: 11),
                  ),
                  onTap: () => context.push('/conversation/${c['id']}'),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
