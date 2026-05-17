import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/supabase/supabase_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_providers.dart';

/// Vérifie si l'utilisateur courant est admin
final isAdminProvider = FutureProvider<bool>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return false;
  try {
    final res = await SupabaseService.client
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
    return (res as List).any((r) => (r as Map)['role'] == 'admin');
  } catch (_) {
    return false;
  }
});

final adminListingsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final res = await SupabaseService.client
      .from('listings')
      .select('*, profiles(display_name), listing_images(image_url)')
      .order('created_at', ascending: false)
      .limit(100);
  return (res as List)
      .map((m) => Map<String, dynamic>.from(m as Map))
      .toList();
});

class AdminScreen extends ConsumerWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAdmin = ref.watch(isAdminProvider);

    return Scaffold(
      appBar: AppBar(title: Text(context.t('account.admin'))),
      body: isAdmin.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (admin) {
          if (!admin) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Accès réservé aux administrateurs.',
                  style: const TextStyle(color: AppColors.mutedForeground),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }
          final listings = ref.watch(adminListingsProvider);
          return listings.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text(e.toString())),
            data: (data) => RefreshIndicator(
              onRefresh: () async => ref.invalidate(adminListingsProvider),
              child: ListView.separated(
                itemCount: data.length,
                separatorBuilder: (_, __) =>
                    const Divider(height: 1, color: AppColors.border),
                itemBuilder: (context, i) {
                  final l = data[i];
                  final imgs = (l['listing_images'] as List?) ?? [];
                  final img = imgs.isNotEmpty
                      ? (imgs.first as Map)['image_url'] as String?
                      : null;
                  return ListTile(
                    leading: SizedBox(
                      width: 56,
                      height: 56,
                      child: img != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(img, fit: BoxFit.cover),
                            )
                          : Container(
                              decoration: BoxDecoration(
                                color: AppColors.muted,
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                    ),
                    title: Text(l['title']?.toString() ?? '',
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text(
                      '${Formatters.price(l['price'] as num? ?? 0)} • ${l['status']}',
                      style: const TextStyle(fontSize: 12),
                    ),
                    trailing: PopupMenuButton<String>(
                      onSelected: (v) async {
                        if (v == 'view') {
                          context.push('/listing/${l['id']}');
                        } else if (v == 'block') {
                          await SupabaseService.client
                              .from('listings')
                              .update({'status': 'blocked'}).eq('id', l['id']);
                          ref.invalidate(adminListingsProvider);
                        } else if (v == 'activate') {
                          await SupabaseService.client
                              .from('listings')
                              .update({'status': 'active'}).eq('id', l['id']);
                          ref.invalidate(adminListingsProvider);
                        } else if (v == 'delete') {
                          await SupabaseService.client
                              .from('listings')
                              .delete()
                              .eq('id', l['id']);
                          ref.invalidate(adminListingsProvider);
                        }
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'view', child: Text('Voir')),
                        PopupMenuItem(value: 'block', child: Text('Bloquer')),
                        PopupMenuItem(value: 'activate', child: Text('Activer')),
                        PopupMenuItem(value: 'delete', child: Text('Supprimer')),
                      ],
                    ),
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }
}
