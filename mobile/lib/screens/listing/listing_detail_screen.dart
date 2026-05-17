import 'package:cached_network_image/cached_network_image.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:share_plus/share_plus.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:url_launcher/url_launcher.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/supabase/supabase_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../data/categories.dart';
import '../../data/cities.dart';
import '../../providers/auth_providers.dart';
import '../../providers/listings_providers.dart';

class ListingDetailScreen extends ConsumerStatefulWidget {
  const ListingDetailScreen({super.key, required this.listingId});
  final String listingId;

  @override
  ConsumerState<ListingDetailScreen> createState() =>
      _ListingDetailScreenState();
}

class _ListingDetailScreenState extends ConsumerState<ListingDetailScreen> {
  int _imageIndex = 0;

  Future<void> _toggleFavorite(Set<String> favs) async {
    final user = SupabaseService.currentUser;
    if (user == null) {
      context.push('/auth?redirect=/listing/${widget.listingId}');
      return;
    }
    if (favs.contains(widget.listingId)) {
      await SupabaseService.client
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', widget.listingId);
    } else {
      await SupabaseService.client.from('favorites').insert({
        'user_id': user.id,
        'listing_id': widget.listingId,
      });
    }
    ref.invalidate(favoritesProvider);
  }

  Future<void> _startConversation(String sellerId) async {
    final user = SupabaseService.currentUser;
    if (user == null) {
      context.push('/auth?redirect=/listing/${widget.listingId}');
      return;
    }
    if (user.id == sellerId) return;
    try {
      final existing = await SupabaseService.client
          .from('conversations')
          .select('id')
          .eq('listing_id', widget.listingId)
          .eq('buyer_id', user.id)
          .eq('seller_id', sellerId)
          .maybeSingle();
      String convId;
      if (existing != null) {
        convId = existing['id'] as String;
      } else {
        final created = await SupabaseService.client
            .from('conversations')
            .insert({
              'listing_id': widget.listingId,
              'buyer_id': user.id,
              'seller_id': sellerId,
            })
            .select('id')
            .single();
        convId = created['id'] as String;
      }
      if (mounted) context.push('/conversation/$convId');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(listingDetailProvider(widget.listingId));
    final favs = ref.watch(favoritesProvider).value ?? {};

    return Scaffold(
      body: detail.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (listing) {
          if (listing == null) {
            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(context.t('listings.notFound'),
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => context.go('/'),
                      child: Text(context.t('listings.backHome')),
                    ),
                  ],
                ),
              ),
            );
          }
          final cat = getCategoryById(listing.categoryId);
          final cityName = getCityById(listing.cityId)?.name ?? listing.cityId;
          final isFav = favs.contains(listing.id);

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                backgroundColor: Colors.white,
                leading: IconButton(
                  icon: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.85),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.arrow_back, color: Colors.black87),
                  ),
                  onPressed: () => context.pop(),
                ),
                actions: [
                  IconButton(
                    onPressed: () => Share.share(
                      '${listing.title} - ${Formatters.price(listing.price)}',
                    ),
                    icon: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.85),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.share2,
                          color: Colors.black87, size: 18),
                    ),
                  ),
                  IconButton(
                    onPressed: () => _toggleFavorite(favs),
                    icon: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.85),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isFav ? Icons.favorite : Icons.favorite_border,
                        color: isFav
                            ? AppColors.destructive
                            : Colors.black87,
                        size: 18,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: listing.images.isEmpty
                      ? Container(
                          color: AppColors.muted,
                          child: const Icon(LucideIcons.image,
                              size: 70,
                              color: AppColors.mutedForeground))
                      : Stack(
                          fit: StackFit.expand,
                          children: [
                            CarouselSlider(
                              options: CarouselOptions(
                                height: 320,
                                viewportFraction: 1,
                                enableInfiniteScroll: listing.images.length > 1,
                                onPageChanged: (i, _) =>
                                    setState(() => _imageIndex = i),
                              ),
                              items: listing.images
                                  .map((u) => CachedNetworkImage(
                                        imageUrl: u,
                                        fit: BoxFit.cover,
                                        width: double.infinity,
                                      ))
                                  .toList(),
                            ),
                            if (listing.images.length > 1)
                              Positioned(
                                bottom: 14,
                                left: 0,
                                right: 0,
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.center,
                                  children: List.generate(
                                    listing.images.length,
                                    (i) => AnimatedContainer(
                                      duration:
                                          const Duration(milliseconds: 200),
                                      margin: const EdgeInsets.symmetric(
                                          horizontal: 3),
                                      width: i == _imageIndex ? 18 : 6,
                                      height: 6,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(3),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(listing.title,
                          style: const TextStyle(
                              fontSize: 22, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 8),
                      Text(
                        Formatters.price(listing.price),
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(LucideIcons.mapPin,
                              size: 14, color: AppColors.mutedForeground),
                          const SizedBox(width: 4),
                          Text(
                            listing.quartier != null
                                ? '${listing.quartier}, $cityName'
                                : cityName,
                            style: const TextStyle(
                                color: AppColors.mutedForeground,
                                fontSize: 13),
                          ),
                          const Spacer(),
                          Text(
                            timeago.format(listing.createdAt, locale: 'fr'),
                            style: const TextStyle(
                                color: AppColors.mutedForeground,
                                fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (cat != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: cat.bgColor,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(cat.icon, color: cat.color, size: 14),
                              const SizedBox(width: 6),
                              Text(
                                context.t(cat.translationKey),
                                style: TextStyle(
                                    color: cat.color,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 16),
                      const Divider(color: AppColors.border, height: 1),
                      const SizedBox(height: 16),
                      Text(context.t('publish.description'),
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 15)),
                      const SizedBox(height: 6),
                      Text(listing.description,
                          style: const TextStyle(height: 1.5)),
                      const SizedBox(height: 20),
                      _SafetyTips(),
                      const SizedBox(height: 16),
                      if (listing.seller != null)
                        InkWell(
                          onTap: () =>
                              context.push('/seller/${listing.userId}'),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.card,
                              border: Border.all(color: AppColors.border),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 22,
                                  backgroundColor: AppColors.muted,
                                  backgroundImage:
                                      listing.seller!.avatarUrl != null
                                          ? NetworkImage(
                                              listing.seller!.avatarUrl!)
                                          : null,
                                  child: listing.seller!.avatarUrl == null
                                      ? const Icon(Icons.person,
                                          color: AppColors.mutedForeground)
                                      : null,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            listing.seller!.effectiveName,
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w700),
                                          ),
                                          if (listing.seller!.isVerified)
                                            const Padding(
                                              padding: EdgeInsets.only(
                                                  left: 4),
                                              child: Icon(Icons.verified,
                                                  size: 16,
                                                  color: AppColors.primary),
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${context.t('detail.memberSince')} ${listing.seller!.createdAt != null ? listing.seller!.createdAt!.year : ''}',
                                        style: const TextStyle(
                                            color: AppColors.mutedForeground,
                                            fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.chevron_right,
                                    color: AppColors.mutedForeground),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: detail.maybeWhen(
        data: (listing) {
          if (listing == null) return null;
          final user = ref.watch(currentUserProvider);
          final isOwner = user?.id == listing.userId;
          if (isOwner) {
            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: ElevatedButton.icon(
                  onPressed: () => context.push('/edit/${listing.id}'),
                  icon: const Icon(LucideIcons.pencil),
                  label: const Text('Modifier'),
                ),
              ),
            );
          }
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => launchUrl(
                          Uri.parse('tel:+235${listing.phone}')),
                      icon: const Icon(LucideIcons.phone, size: 18),
                      label: Text(listing.phone),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _startConversation(listing.userId),
                      icon: const Icon(LucideIcons.messageCircle, size: 18),
                      label: Text(context.t('contact.chat')),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        orElse: () => null,
      ),
    );
  }
}

class _SafetyTips extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.accent,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(context.t('safety.title'),
              style: const TextStyle(
                  fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 6),
          ...['safety.tip1', 'safety.tip2', 'safety.tip3', 'safety.tip4']
              .map((k) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('• ', style: TextStyle(height: 1.4)),
                        Expanded(
                            child: Text(context.t(k),
                                style: const TextStyle(
                                    fontSize: 12.5, height: 1.4))),
                      ],
                    ),
                  )),
        ],
      ),
    );
  }
}
