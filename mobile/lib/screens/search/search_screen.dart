import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/listings_providers.dart';
import '../../widgets/listing_card.dart';
import '../../widgets/listing_card_skeleton.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _ctrl = TextEditingController();
  String _query = '';
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    _ctrl.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      setState(() => _query = value.trim());
    });
  }

  @override
  Widget build(BuildContext context) {
    final favorites = ref.watch(favoritesProvider).value ?? {};
    final listings = _query.isEmpty
        ? null
        : ref.watch(listingsProvider(ListingsFilter(query: _query, limit: 50)));

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _ctrl,
          autofocus: true,
          onChanged: _onChanged,
          decoration: InputDecoration(
            hintText: context.t('search.placeholder'),
            border: InputBorder.none,
            prefixIcon: const Icon(LucideIcons.search, size: 18),
          ),
        ),
      ),
      body: _query.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(LucideIcons.search,
                        size: 64, color: AppColors.mutedForeground),
                    const SizedBox(height: 16),
                    Text(
                      context.t('search.find'),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          fontSize: 17, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      context.t('search.useBar'),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          color: AppColors.mutedForeground, fontSize: 13),
                    ),
                  ],
                ),
              ),
            )
          : listings!.when(
              loading: () => const ListingGridSkeleton(),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) {
                if (data.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.searchX,
                            size: 56, color: AppColors.mutedForeground),
                        const SizedBox(height: 8),
                        Text(context.t('search.noResults'),
                            style: const TextStyle(
                                fontWeight: FontWeight.w600)),
                        Text(context.t('search.tryOther'),
                            style: const TextStyle(
                                color: AppColors.mutedForeground)),
                      ],
                    ),
                  );
                }
                return GridView.builder(
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
                );
              },
            ),
    );
  }
}
