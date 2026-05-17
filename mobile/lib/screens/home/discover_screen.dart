import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/listings_providers.dart';
import '../../widgets/listing_card.dart';
import '../../widgets/listing_card_skeleton.dart';

class DiscoverScreen extends ConsumerWidget {
  const DiscoverScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favorites = ref.watch(favoritesProvider).value ?? {};
    final all = ref.watch(listingsProvider(const ListingsFilter(limit: 30)));

    return Scaffold(
      appBar: AppBar(title: Text(context.t('discover.title'))),
      body: all.when(
        loading: () => const ListingGridSkeleton(),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (listings) {
          if (listings.isEmpty) {
            return Center(
              child: Text(context.t('listings.none'),
                  style: const TextStyle(color: AppColors.mutedForeground)),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(listingsProvider),
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: listings.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.62,
              ),
              itemBuilder: (context, i) {
                final l = listings[i];
                return ListingCard(
                  listing: l,
                  isFavorite: favorites.contains(l.id),
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
