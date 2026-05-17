import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../data/categories.dart';
import '../../providers/listings_providers.dart';
import '../../widgets/listing_card.dart';
import '../../widgets/listing_card_skeleton.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recentListings =
        ref.watch(listingsProvider(const ListingsFilter(limit: 10)));
    final favorites = ref.watch(favoritesProvider).value ?? {};

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(listingsProvider);
          ref.invalidate(favoritesProvider);
        },
        child: CustomScrollView(
          slivers: [
            _HomeAppBar(),
            SliverToBoxAdapter(child: _HeroSection()),
            SliverToBoxAdapter(
              child: _SectionHeader(
                title: context.t('footer.categories'),
              ),
            ),
            SliverToBoxAdapter(child: _CategoriesGrid()),
            SliverToBoxAdapter(
              child: _SectionHeader(
                title: context.t('listings.recent'),
                actionLabel: context.t('listings.seeMore'),
                onAction: () => context.go('/discover'),
              ),
            ),
            recentListings.when(
              loading: () => const SliverToBoxAdapter(
                child: ListingGridSkeleton(count: 4),
              ),
              error: (e, _) => SliverToBoxAdapter(
                child: _ErrorView(message: e.toString()),
              ),
              data: (listings) {
                if (listings.isEmpty) {
                  return SliverToBoxAdapter(
                    child: _EmptyState(
                      text: context.t('listings.beFirst'),
                    ),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg, vertical: 8),
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
                        final listing = listings[i];
                        return ListingCard(
                          listing: listing,
                          isFavorite: favorites.contains(listing.id),
                          onTap: () => context.push('/listing/${listing.id}'),
                        );
                      },
                      childCount: listings.length,
                    ),
                  ),
                );
              },
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }
}

class _HomeAppBar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SliverAppBar(
      floating: true,
      pinned: false,
      backgroundColor: AppColors.background,
      surfaceTintColor: AppColors.background,
      elevation: 0,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.chadBlue],
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(LucideIcons.shoppingBag,
                color: Colors.white, size: 18),
          ),
          const SizedBox(width: 10),
          const Text(
            'SooqKabro',
            style: TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 20,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          onPressed: () => _showLocalePicker(context, ref),
          icon: const Icon(LucideIcons.globe),
        ),
      ],
    );
  }

  void _showLocalePicker(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: AppLocale.values
              .map((l) => ListTile(
                    title: Text(l.label),
                    trailing: ref.watch(localeProvider) == l
                        ? const Icon(Icons.check, color: AppColors.primary)
                        : null,
                    onTap: () {
                      ref.read(localeProvider.notifier).setLocale(l);
                      Navigator.pop(context);
                    },
                  ))
              .toList(),
        ),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, Color(0xFF2A5DC9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            context.t('hero.title1'),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w800,
              height: 1.1,
            ),
          ),
          Text(
            context.t('hero.title2'),
            style: const TextStyle(
              color: AppColors.chadYellow,
              fontSize: 26,
              fontWeight: FontWeight.w800,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            context.t('hero.subtitle'),
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 16),
          InkWell(
            onTap: () => context.go('/search'),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.search,
                      color: AppColors.mutedForeground, size: 18),
                  const SizedBox(width: 10),
                  Text(
                    context.t('search.placeholder'),
                    style: const TextStyle(
                      color: AppColors.mutedForeground,
                      fontSize: 14,
                    ),
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

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    this.actionLabel,
    this.onAction,
  });
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          if (actionLabel != null && onAction != null)
            TextButton(
              onPressed: onAction,
              child: Text(actionLabel!),
            ),
        ],
      ),
    );
  }
}

class _CategoriesGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.85,
      ),
      itemBuilder: (context, i) {
        final cat = categories[i];
        return InkWell(
          onTap: () => context.push('/category/${cat.id}'),
          borderRadius: BorderRadius.circular(14),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: cat.bgColor,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(cat.icon, color: cat.color, size: 24),
              ),
              const SizedBox(height: 6),
              Text(
                context.t(cat.translationKey),
                maxLines: 2,
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  height: 1.2,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.text});
  final String text;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Center(
        child: Column(
          children: [
            const Icon(LucideIcons.packageOpen,
                size: 56, color: AppColors.mutedForeground),
            const SizedBox(height: 12),
            Text(
              text,
              style: const TextStyle(color: AppColors.mutedForeground),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message});
  final String message;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Text(
        '${context.t('common.error')}: $message',
        style: const TextStyle(color: AppColors.destructive),
      ),
    );
  }
}
