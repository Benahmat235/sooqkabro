import 'profile.dart';

class Listing {
  Listing({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    this.originalPrice,
    required this.categoryId,
    required this.subcategoryId,
    required this.cityId,
    this.quartier,
    required this.phone,
    required this.userId,
    required this.status,
    this.badge,
    required this.createdAt,
    this.images = const [],
    this.seller,
  });

  final String id;
  final String title;
  final String description;
  final num price;
  final num? originalPrice;
  final String categoryId;
  final String subcategoryId;
  final String cityId;
  final String? quartier;
  final String phone;
  final String userId;
  final String status;
  final String? badge;
  final DateTime createdAt;
  final List<String> images;
  final Profile? seller;

  String? get firstImage => images.isNotEmpty ? images.first : null;

  factory Listing.fromMap(Map<String, dynamic> map) {
    final imgs = (map['listing_images'] as List?)
            ?.map((e) => (e as Map)['image_url'] as String)
            .toList() ??
        <String>[];
    Profile? seller;
    if (map['profiles'] is Map) {
      seller = Profile.fromMap(Map<String, dynamic>.from(map['profiles']));
    }
    return Listing(
      id: map['id'] as String,
      title: (map['title'] ?? '') as String,
      description: (map['description'] ?? '') as String,
      price: (map['price'] ?? 0) as num,
      originalPrice: map['original_price'] as num?,
      categoryId: (map['category_id'] ?? '') as String,
      subcategoryId: (map['subcategory_id'] ?? '') as String,
      cityId: (map['city_id'] ?? '') as String,
      quartier: map['quartier'] as String?,
      phone: (map['phone'] ?? '') as String,
      userId: (map['user_id'] ?? '') as String,
      status: (map['status'] ?? 'active') as String,
      badge: map['badge'] as String?,
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '') ??
          DateTime.now(),
      images: imgs,
      seller: seller,
    );
  }
}
