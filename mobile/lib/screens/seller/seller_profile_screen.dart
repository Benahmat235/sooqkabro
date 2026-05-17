import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/supabase/supabase_service.dart';
import '../../core/theme/app_theme.dart';
import '../../models/profile.dart';
import '../../providers/listings_providers.dart';
import '../../widgets/listing_card.dart';
import '../../widgets/listing_card_skeleton.dart';

final sellerProfileProvider =
    FutureProvider.family<Profile?, String>((ref, id) async {
  final res = await SupabaseService.client
      .from('profiles')
      .select()
      .eq('id', id)
      .maybeSingle();
  if (res == null) return null;
  return Profile.fromMap(Map<String, dynamic>.from(res));
});

class SellerProfileScreen extends ConsumerWidget {
  const SellerProfileScreen({super.key, required this.sellerId});
  final String sellerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(sellerProfileProvider(sellerId));
    final listings =
        ref.watch(listingsProvider(ListingsFilter(userId: sellerId, limit: 50)));
    final favs = ref.watch(favoritesProvider).value ?? {};

    return Scaffold(
      appBar: AppBar(title: Text(context.t('detail.seller'))),
      body: profile.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (p) {
          if (p == null) {
            return Center(child: Text(context.t('listings.notFound')));
          }
          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 42,
                        backgroundColor: AppColors.muted,
                        backgroundImage: p.avatarUrl != null
                            ? NetworkImage(p.avatarUrl!)
                            : null,
                        child: p.avatarUrl == null
                            ? const Icon(Icons.person,
                                size: 40, color: AppColors.mutedForeground)
                            : null,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(p.effectiveName,
                              style: const TextStyle(
                                  fontSize: 19, fontWeight: FontWeight.w800)),
                          if (p.isVerified)
                            const Padding(
                              padding: EdgeInsets.only(left: 6),
                              child: Icon(Icons.verified,
                                  color: AppColors.primary),
                            ),
                        ],
                      ),
                      if (p.createdAt != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          '${context.t('detail.memberSince')} ${p.createdAt!.year}',
                          style: const TextStyle(
                              color: AppColors.mutedForeground, fontSize: 12),
                        ),
                      ],
                      if (p.bio != null && p.bio!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(p.bio!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 13)),
                      ],
                    ],
                  ),
                ),
              ),
              listings.when(
                loading: () =>
                    const SliverToBoxAdapter(child: ListingGridSkeleton()),
                error: (e, _) =>
                    SliverToBoxAdapter(child: Center(child: Text(e.toString()))),
                data: (data) => SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverGrid(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.62,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, i) {
                        final l = data[i];
                        return ListingCard(
                          listing: l,
                          isFavorite: favs.contains(l.id),
                          onTap: () => context.push('/listing/${l.id}'),
                        );
                      },
                      childCount: data.length,
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
