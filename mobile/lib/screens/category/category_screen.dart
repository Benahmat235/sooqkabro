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

class CategoryScreen extends ConsumerStatefulWidget {
  const CategoryScreen({super.key, required this.categoryId});
  final String categoryId;

  @override
  ConsumerState<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends ConsumerState<CategoryScreen> {
  String? _selectedSub;

  @override
  Widget build(BuildContext context) {
    final cat = getCategoryById(widget.categoryId);
    if (cat == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: Text(context.t('listings.notFound'))),
      );
    }
    final favorites = ref.watch(favoritesProvider).value ?? {};
    final listings = ref.watch(listingsProvider(ListingsFilter(
      categoryId: cat.id,
      subcategoryId: _selectedSub,
      limit: 50,
    )));

    return Scaffold(
      appBar: AppBar(
        title: Text(context.t(cat.translationKey)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 46,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              scrollDirection: Axis.horizontal,
              itemCount: cat.subcategories.length + 1,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                if (i == 0) {
                  final sel = _selectedSub == null;
                  return _Chip(
                    label: context.t('filter.all'),
                    selected: sel,
                    onTap: () => setState(() => _selectedSub = null),
                  );
                }
                final sub = cat.subcategories[i - 1];
                final sel = _selectedSub == sub.id;
                return _Chip(
                  label: sub.name,
                  selected: sel,
                  onTap: () => setState(() => _selectedSub = sub.id),
                );
              },
            ),
          ),
          Expanded(
            child: listings.when(
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
                        const SizedBox(height: 8),
                        Text(context.t('listings.none')),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(listingsProvider),
                  child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: data.length,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.62,
                    ),
                    itemBuilder: (context, i) {
                      final l = data[i];
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
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip(
      {required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: selected ? AppColors.primary : AppColors.muted,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: selected ? Colors.white : AppColors.foreground,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}
