import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/supabase/supabase_service.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_providers.dart';
import '../../providers/listings_providers.dart';
import '../../widgets/listing_card.dart';
import '../../widgets/listing_card_skeleton.dart';

class MyListingsScreen extends ConsumerWidget {
  const MyListingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: Text(context.t('account.myListings'))),
        body: Center(child: Text(context.t('account.loginPrompt'))),
      );
    }
    final listings =
        ref.watch(listingsProvider(ListingsFilter(userId: user.id, limit: 100)));
    final favs = ref.watch(favoritesProvider).value ?? {};

    return Scaffold(
      appBar: AppBar(title: Text(context.t('account.myListings'))),
      body: listings.when(
        loading: () => const ListingGridSkeleton(),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (data) {
          if (data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(LucideIcons.packageOpen,
                      size: 56, color: AppColors.mutedForeground),
                  const SizedBox(height: 12),
                  Text(context.t('listings.none'),
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(context.t('listings.beFirst'),
                      style: const TextStyle(color: AppColors.mutedForeground)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => context.push('/publish'),
                    icon: const Icon(LucideIcons.plus),
                    label: Text(context.t('nav.publish')),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(listingsProvider),
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: data.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.56,
              ),
              itemBuilder: (context, i) {
                final l = data[i];
                return Column(
                  children: [
                    Expanded(
                      child: ListingCard(
                        listing: l,
                        isFavorite: favs.contains(l.id),
                        onTap: () => context.push('/listing/${l.id}'),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: TextButton.icon(
                            onPressed: () => context.push('/edit/${l.id}'),
                            icon:
                                const Icon(LucideIcons.pencil, size: 14),
                            label: const Text('Modifier',
                                style: TextStyle(fontSize: 11)),
                          ),
                        ),
                        IconButton(
                          onPressed: () async {
                            final ok = await showDialog<bool>(
                              context: context,
                              builder: (_) => AlertDialog(
                                title: const Text('Supprimer ?'),
                                actions: [
                                  TextButton(
                                    onPressed: () =>
                                        Navigator.pop(context, false),
                                    child: Text(context.t('detail.cancel')),
                                  ),
                                  TextButton(
                                    onPressed: () =>
                                        Navigator.pop(context, true),
                                    child: const Text('Supprimer'),
                                  ),
                                ],
                              ),
                            );
                            if (ok == true) {
                              await SupabaseService.client
                                  .from('listings')
                                  .delete()
                                  .eq('id', l.id);
                              ref.invalidate(listingsProvider);
                            }
                          },
                          icon: const Icon(LucideIcons.trash2,
                              size: 16, color: AppColors.destructive),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),
          );
        },
      ),
    );
  }
}
