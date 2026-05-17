import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_providers.dart';
import '../../providers/listings_providers.dart';
import '../../widgets/listing_card.dart';
import '../../widgets/listing_card_skeleton.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: Text(context.t('nav.favorites'))),
        body: Center(child: Text(context.t('account.loginPrompt'))),
      );
    }
    final listings = ref.watch(favoriteListingsProvider);
    final favs = ref.watch(favoritesProvider).value ?? {};

    return Scaffold(
      appBar: AppBar(title: Text(context.t('nav.favorites'))),
      body: listings.when(
        loading: () => const ListingGridSkeleton(),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (data) {
          if (data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(LucideIcons.heart,
                      size: 64, color: AppColors.mutedForeground),
                  const SizedBox(height: 12),
                  Text(context.t('listings.none')),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(favoriteListingsProvider);
              ref.invalidate(favoritesProvider);
            },
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: data.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.62,
              ),
              itemBuilder: (context, i) {
                final l = data[i];
                return ListingCard(
                  listing: l,
                  isFavorite: favs.contains(l.id),
                  onTap: () => context.push('/listing/${l.id}'),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
