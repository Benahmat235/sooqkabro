import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/supabase/supabase_service.dart';
import '../models/listing.dart';
import 'auth_providers.dart';

class ListingsFilter {
  const ListingsFilter({
    this.categoryId,
    this.subcategoryId,
    this.cityId,
    this.query,
    this.userId,
    this.sort = 'recent',
    this.minPrice,
    this.maxPrice,
    this.limit = 30,
  });
  final String? categoryId;
  final String? subcategoryId;
  final String? cityId;
  final String? query;
  final String? userId;
  final String sort;
  final num? minPrice;
  final num? maxPrice;
  final int limit;
}

/// Récupération paginée d'annonces avec filtres.
final listingsProvider =
    FutureProvider.family<List<Listing>, ListingsFilter>((ref, filter) async {
  var query = SupabaseService.client
      .from('listings')
      .select('*, listing_images(image_url, position), profiles(*)')
      .eq('status', 'active');

  if (filter.categoryId != null) {
    query = query.eq('category_id', filter.categoryId as Object);
  }
  if (filter.subcategoryId != null) {
    query = query.eq('subcategory_id', filter.subcategoryId as Object);
  }
  if (filter.cityId != null) {
    query = query.eq('city_id', filter.cityId as Object);
  }
  if (filter.userId != null) {
    query = query.eq('user_id', filter.userId as Object);
  }
  if (filter.query != null && filter.query!.isNotEmpty) {
    query = query.ilike('title', '%${filter.query}%');
  }
  if (filter.minPrice != null) {
    query = query.gte('price', filter.minPrice as Object);
  }
  if (filter.maxPrice != null) {
    query = query.lte('price', filter.maxPrice as Object);
  }

  final ordered = switch (filter.sort) {
    'priceAsc' => query.order('price', ascending: true),
    'priceDesc' => query.order('price', ascending: false),
    _ => query.order('created_at', ascending: false),
  };

  final res = await ordered.limit(filter.limit);
  return (res as List)
      .map((m) => Listing.fromMap(Map<String, dynamic>.from(m as Map)))
      .toList();
});

/// Détails d'une annonce par ID.
final listingDetailProvider =
    FutureProvider.family<Listing?, String>((ref, id) async {
  final res = await SupabaseService.client
      .from('listings')
      .select('*, listing_images(image_url, position), profiles(*)')
      .eq('id', id)
      .maybeSingle();
  if (res == null) return null;
  // Track view
  final user = SupabaseService.currentUser;
  try {
    await SupabaseService.client.from('listing_views').insert({
      'listing_id': id,
      if (user != null) 'viewer_id': user.id,
    });
  } catch (_) {}
  return Listing.fromMap(Map<String, dynamic>.from(res));
});

/// Mes favoris (IDs)
final favoritesProvider = FutureProvider<Set<String>>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return {};
  final res = await SupabaseService.client
      .from('favorites')
      .select('listing_id')
      .eq('user_id', user.id);
  return (res as List)
      .map((m) => (m as Map)['listing_id'] as String)
      .toSet();
});

/// Listings favoris complets
final favoriteListingsProvider = FutureProvider<List<Listing>>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  final fav = await SupabaseService.client
      .from('favorites')
      .select('listing_id')
      .eq('user_id', user.id);
  final ids = (fav as List)
      .map((m) => (m as Map)['listing_id'] as String)
      .toList();
  if (ids.isEmpty) return [];
  final listings = await SupabaseService.client
      .from('listings')
      .select('*, listing_images(image_url, position), profiles(*)')
      .inFilter('id', ids);
  return (listings as List)
      .map((m) => Listing.fromMap(Map<String, dynamic>.from(m as Map)))
      .toList();
});
