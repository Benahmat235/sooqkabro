import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class SubCategory {
  const SubCategory({required this.id, required this.name});
  final String id;
  final String name;
}

class CategoryData {
  const CategoryData({
    required this.id,
    required this.name,
    required this.translationKey,
    required this.icon,
    required this.color,
    required this.bgColor,
    required this.subcategories,
  });

  final String id;
  final String name;
  final String translationKey;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final List<SubCategory> subcategories;
}

const categories = <CategoryData>[
  CategoryData(
    id: 'vehicules',
    name: 'Véhicules & Transports',
    translationKey: 'cat.vehicules',
    icon: LucideIcons.car,
    color: Color(0xFF2563EB),
    bgColor: Color(0xFFEFF6FF),
    subcategories: [
      SubCategory(id: 'voitures', name: "Voitures d'occasion"),
      SubCategory(id: 'motos', name: 'Motos et cyclomoteurs'),
      SubCategory(id: 'camions', name: 'Camions et poids lourds'),
      SubCategory(id: 'pieces', name: 'Pièces détachées'),
      SubCategory(id: 'location-vehicules', name: 'Location de véhicules'),
      SubCategory(id: 'transport', name: 'Transport de marchandises'),
    ],
  ),
  CategoryData(
    id: 'immobilier',
    name: 'Immobilier',
    translationKey: 'cat.immobilier',
    icon: LucideIcons.home,
    color: Color(0xFF16A34A),
    bgColor: Color(0xFFF0FDF4),
    subcategories: [
      SubCategory(id: 'maisons-vente', name: 'Maisons à vendre'),
      SubCategory(id: 'maisons-louer', name: 'Maisons à louer'),
      SubCategory(id: 'appartements', name: 'Appartements'),
      SubCategory(id: 'terrains', name: 'Terrains et parcelles'),
      SubCategory(id: 'bureaux', name: 'Bureaux et commerces'),
      SubCategory(id: 'colocation', name: 'Colocation'),
    ],
  ),
  CategoryData(
    id: 'telephones',
    name: 'Téléphones & Tablettes',
    translationKey: 'cat.telephones',
    icon: LucideIcons.smartphone,
    color: Color(0xFF9333EA),
    bgColor: Color(0xFFFAF5FF),
    subcategories: [
      SubCategory(id: 'iphone', name: 'iPhone'),
      SubCategory(id: 'samsung', name: 'Samsung'),
      SubCategory(id: 'tecno', name: 'Tecno / Infinix / Itel'),
      SubCategory(id: 'accessoires-tel', name: 'Accessoires téléphoniques'),
      SubCategory(id: 'reparation', name: 'Réparation téléphone'),
    ],
  ),
  CategoryData(
    id: 'emploi',
    name: 'Emploi & Formation',
    translationKey: 'cat.emploi',
    icon: LucideIcons.briefcase,
    color: Color(0xFFD97706),
    bgColor: Color(0xFFFFFBEB),
    subcategories: [
      SubCategory(id: 'offres-emploi', name: "Offres d'emploi"),
      SubCategory(id: 'recherche-emploi', name: "Recherche d'emploi"),
      SubCategory(id: 'formation', name: 'Formation professionnelle'),
      SubCategory(id: 'stages', name: 'Stages'),
    ],
  ),
  CategoryData(
    id: 'services',
    name: 'Services',
    translationKey: 'cat.services',
    icon: LucideIcons.wrench,
    color: Color(0xFF0891B2),
    bgColor: Color(0xFFECFEFF),
    subcategories: [
      SubCategory(id: 'telecom', name: 'Télécommunications'),
      SubCategory(id: 'transfert-argent', name: "Transfert d'argent"),
      SubCategory(id: 'transport-logistique', name: 'Transport et logistique'),
      SubCategory(id: 'construction', name: 'Construction et rénovation'),
      SubCategory(id: 'securite', name: 'Sécurité et gardiennage'),
      SubCategory(id: 'informatique', name: 'Informatique et internet'),
      SubCategory(id: 'photo-video', name: 'Photographie et vidéo'),
    ],
  ),
  CategoryData(
    id: 'animaux',
    name: 'Animaux & Élevage',
    translationKey: 'cat.animaux',
    icon: LucideIcons.dog,
    color: Color(0xFFEA580C),
    bgColor: Color(0xFFFFF7ED),
    subcategories: [
      SubCategory(id: 'chiens', name: 'Chiens de garde'),
      SubCategory(id: 'chats', name: 'Chats'),
      SubCategory(id: 'volailles', name: 'Volailles'),
      SubCategory(id: 'betail', name: 'Bétail'),
      SubCategory(id: 'aliments-animaux', name: 'Aliments pour animaux'),
    ],
  ),
  CategoryData(
    id: 'mode',
    name: 'Mode & Beauté',
    translationKey: 'cat.mode',
    icon: LucideIcons.shirt,
    color: Color(0xFFDB2777),
    bgColor: Color(0xFFFDF2F8),
    subcategories: [
      SubCategory(id: 'vetements-hommes', name: 'Vêtements hommes'),
      SubCategory(id: 'vetements-femmes', name: 'Vêtements femmes'),
      SubCategory(id: 'vetements-enfants', name: 'Vêtements enfants'),
      SubCategory(id: 'chaussures', name: 'Chaussures'),
      SubCategory(id: 'tissus', name: 'Tissus et wax'),
      SubCategory(id: 'coiffure', name: 'Coiffure et beauté'),
    ],
  ),
  CategoryData(
    id: 'maison',
    name: 'Maison & Meubles',
    translationKey: 'cat.maison',
    icon: LucideIcons.sofa,
    color: Color(0xFF0D9488),
    bgColor: Color(0xFFF0FDFA),
    subcategories: [
      SubCategory(id: 'meubles-salon', name: 'Meubles salon'),
      SubCategory(id: 'meubles-chambre', name: 'Meubles chambre'),
      SubCategory(id: 'electromenager', name: 'Électroménager'),
      SubCategory(id: 'decoration', name: 'Décoration'),
    ],
  ),
  CategoryData(
    id: 'electronique',
    name: 'Électronique',
    translationKey: 'cat.electronique',
    icon: LucideIcons.monitor,
    color: Color(0xFF4F46E5),
    bgColor: Color(0xFFEEF2FF),
    subcategories: [
      SubCategory(id: 'ordinateurs', name: 'Ordinateurs et accessoires'),
      SubCategory(id: 'tv-audio', name: 'TV et audio'),
      SubCategory(id: 'jeux-video', name: 'Jeux vidéo'),
    ],
  ),
  CategoryData(
    id: 'alimentation',
    name: 'Alimentation',
    translationKey: 'cat.alimentation',
    icon: LucideIcons.utensilsCrossed,
    color: Color(0xFFDC2626),
    bgColor: Color(0xFFFEF2F2),
    subcategories: [
      SubCategory(id: 'produits-frais', name: 'Produits frais'),
      SubCategory(id: 'epicerie', name: 'Épicerie'),
      SubCategory(id: 'restauration', name: 'Restauration'),
    ],
  ),
];

CategoryData? getCategoryById(String id) {
  for (final c in categories) {
    if (c.id == id) return c;
  }
  return null;
}

String? getSubcategoryName(String categoryId, String subId) {
  final cat = getCategoryById(categoryId);
  if (cat == null) return null;
  for (final s in cat.subcategories) {
    if (s.id == subId) return s.name;
  }
  return null;
}
