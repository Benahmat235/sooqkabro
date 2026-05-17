import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/supabase/supabase_service.dart';
import '../../core/theme/app_theme.dart';
import '../../data/categories.dart';
import '../../data/cities.dart';
import '../../providers/listings_providers.dart';

class PublishScreen extends ConsumerStatefulWidget {
  const PublishScreen({super.key, this.editingId});
  final String? editingId;

  @override
  ConsumerState<PublishScreen> createState() => _PublishScreenState();
}

class _PublishScreenState extends ConsumerState<PublishScreen> {
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _phone = TextEditingController();
  CategoryData? _category;
  SubCategory? _subcategory;
  CityData? _city;
  String? _quartier;
  final List<XFile> _newImages = [];
  final List<String> _existingImages = [];
  bool _loading = false;
  bool _initialized = false;

  static const int maxImages = 8;

  @override
  void initState() {
    super.initState();
    if (widget.editingId != null) _loadExisting();
  }

  Future<void> _loadExisting() async {
    final res = await SupabaseService.client
        .from('listings')
        .select('*, listing_images(image_url, position)')
        .eq('id', widget.editingId!)
        .single();
    setState(() {
      _title.text = (res['title'] ?? '') as String;
      _description.text = (res['description'] ?? '') as String;
      _price.text = (res['price'] ?? 0).toString();
      _phone.text = (res['phone'] ?? '') as String;
      _category = getCategoryById(res['category_id'] as String);
      if (_category != null) {
        final subId = res['subcategory_id'] as String;
        for (final s in _category!.subcategories) {
          if (s.id == subId) _subcategory = s;
        }
      }
      _city = getCityById(res['city_id'] as String);
      _quartier = res['quartier'] as String?;
      final imgs = (res['listing_images'] as List?) ?? [];
      _existingImages.addAll(imgs.map((m) => (m as Map)['image_url'] as String));
      _initialized = true;
    });
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _price.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    if (_newImages.length + _existingImages.length >= maxImages) return;
    final picker = ImagePicker();
    final picked = await picker.pickMultiImage(imageQuality: 75);
    final remaining = maxImages - _newImages.length - _existingImages.length;
    setState(() => _newImages.addAll(picked.take(remaining)));
  }

  Future<List<String>> _uploadImages(String listingId) async {
    final urls = <String>[];
    final user = SupabaseService.currentUser!;
    for (var i = 0; i < _newImages.length; i++) {
      final f = File(_newImages[i].path);
      final bytes = await f.readAsBytes();
      final ext = _newImages[i].name.split('.').last.toLowerCase();
      final path = '${user.id}/$listingId/${DateTime.now().millisecondsSinceEpoch}-$i.$ext';
      await SupabaseService.client.storage.from('listings').uploadBinary(
            path,
            bytes,
            fileOptions:
                FileOptions(contentType: 'image/$ext', upsert: false),
          );
      final url =
          SupabaseService.client.storage.from('listings').getPublicUrl(path);
      urls.add(url);
    }
    return urls;
  }

  Future<void> _submit() async {
    final user = SupabaseService.currentUser;
    if (user == null) return;
    if (_title.text.isEmpty ||
        _description.text.isEmpty ||
        _price.text.isEmpty ||
        _phone.text.isEmpty ||
        _category == null ||
        _subcategory == null ||
        _city == null) {
      _snack(context.t('publish.fillRequired'));
      return;
    }
    final phone = _phone.text.replaceAll(RegExp(r'\D'), '');
    if (phone.length != 8) {
      _snack(context.t('publish.phoneInvalid'));
      return;
    }
    final price = num.tryParse(_price.text.replaceAll(',', '.')) ?? 0;
    setState(() => _loading = true);
    try {
      String listingId;
      if (widget.editingId != null) {
        listingId = widget.editingId!;
        await SupabaseService.client.from('listings').update({
          'title': _title.text.trim(),
          'description': _description.text.trim(),
          'price': price,
          'phone': phone,
          'category_id': _category!.id,
          'subcategory_id': _subcategory!.id,
          'city_id': _city!.id,
          'quartier': _quartier,
          'updated_at': DateTime.now().toUtc().toIso8601String(),
        }).eq('id', listingId);
      } else {
        final inserted = await SupabaseService.client
            .from('listings')
            .insert({
              'title': _title.text.trim(),
              'description': _description.text.trim(),
              'price': price,
              'phone': phone,
              'category_id': _category!.id,
              'subcategory_id': _subcategory!.id,
              'city_id': _city!.id,
              'quartier': _quartier,
              'user_id': user.id,
            })
            .select('id')
            .single();
        listingId = inserted['id'] as String;
      }

      if (_newImages.isNotEmpty) {
        final urls = await _uploadImages(listingId);
        final rows = <Map<String, dynamic>>[];
        for (var i = 0; i < urls.length; i++) {
          rows.add({
            'listing_id': listingId,
            'image_url': urls[i],
            'position': _existingImages.length + i,
          });
        }
        await SupabaseService.client.from('listing_images').insert(rows);
      }

      ref.invalidate(listingsProvider);
      ref.invalidate(listingDetailProvider(listingId));
      if (mounted) {
        _snack(context.t('publish.success'));
        context.go('/listing/$listingId');
      }
    } catch (e) {
      _snack(e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.editingId != null;
    if (isEdit && !_initialized) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    return Scaffold(
      appBar: AppBar(title: Text(context.t('publish.title'))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Label('${context.t('publish.photos')} (${context.t('publish.upTo')} $maxImages)'),
            const SizedBox(height: 8),
            _PhotoGrid(
              existing: _existingImages,
              picked: _newImages,
              onAdd: _pickImages,
              onRemoveExisting: (url) async {
                setState(() => _existingImages.remove(url));
                if (widget.editingId != null) {
                  await SupabaseService.client
                      .from('listing_images')
                      .delete()
                      .eq('image_url', url);
                }
              },
              onRemovePicked: (i) => setState(() => _newImages.removeAt(i)),
            ),
            const SizedBox(height: 16),
            _Label(context.t('publish.category')),
            DropdownButtonFormField<CategoryData>(
              initialValue: _category,
              hint: Text(context.t('publish.choose')),
              items: categories
                  .map((c) => DropdownMenuItem(
                        value: c,
                        child: Text(context.t(c.translationKey)),
                      ))
                  .toList(),
              onChanged: (v) => setState(() {
                _category = v;
                _subcategory = null;
              }),
            ),
            if (_category != null) ...[
              const SizedBox(height: 12),
              _Label(context.t('publish.subcategory')),
              DropdownButtonFormField<SubCategory>(
                initialValue: _subcategory,
                hint: Text(context.t('publish.choose')),
                items: _category!.subcategories
                    .map((s) => DropdownMenuItem(value: s, child: Text(s.name)))
                    .toList(),
                onChanged: (v) => setState(() => _subcategory = v),
              ),
            ],
            const SizedBox(height: 12),
            _Label(context.t('publish.adTitle')),
            TextField(
              controller: _title,
              decoration: InputDecoration(
                  hintText: context.t('publish.titlePlaceholder')),
            ),
            const SizedBox(height: 12),
            _Label(context.t('publish.description')),
            TextField(
              controller: _description,
              maxLines: 5,
              decoration: InputDecoration(
                  hintText: context.t('publish.descPlaceholder')),
            ),
            const SizedBox(height: 12),
            _Label(context.t('publish.price')),
            TextField(
              controller: _price,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(hintText: '0'),
            ),
            const SizedBox(height: 12),
            _Label(context.t('publish.city')),
            DropdownButtonFormField<CityData>(
              initialValue: _city,
              hint: Text(context.t('publish.choose')),
              items: cities
                  .map((c) => DropdownMenuItem(value: c, child: Text(c.name)))
                  .toList(),
              onChanged: (v) => setState(() {
                _city = v;
                _quartier = null;
              }),
            ),
            if (_city != null && _city!.quartiers.isNotEmpty) ...[
              const SizedBox(height: 12),
              _Label(context.t('publish.quartier')),
              DropdownButtonFormField<String>(
                initialValue: _quartier,
                hint: Text(context.t('publish.choose')),
                items: _city!.quartiers
                    .map((q) => DropdownMenuItem(value: q, child: Text(q)))
                    .toList(),
                onChanged: (v) => setState(() => _quartier = v),
              ),
            ],
            const SizedBox(height: 12),
            _Label(context.t('publish.phone')),
            TextField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(hintText: '6X XX XX XX'),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loading ? null : _submit,
              icon: _loading
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Icon(LucideIcons.send),
              label: Text(
                _loading
                    ? context.t('publish.submitting')
                    : context.t('publish.submitBtn'),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(text,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
    );
  }
}

class _PhotoGrid extends StatelessWidget {
  const _PhotoGrid({
    required this.existing,
    required this.picked,
    required this.onAdd,
    required this.onRemoveExisting,
    required this.onRemovePicked,
  });
  final List<String> existing;
  final List<XFile> picked;
  final VoidCallback onAdd;
  final void Function(String) onRemoveExisting;
  final void Function(int) onRemovePicked;

  @override
  Widget build(BuildContext context) {
    final items = <Widget>[
      ...existing.map((u) => _Thumb(
            child: Image.network(u, fit: BoxFit.cover),
            onRemove: () => onRemoveExisting(u),
          )),
      ...picked.asMap().entries.map((e) => _Thumb(
            child: Image.file(File(e.value.path), fit: BoxFit.cover),
            onRemove: () => onRemovePicked(e.key),
          )),
      InkWell(
        onTap: onAdd,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.muted,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border, style: BorderStyle.solid),
          ),
          child: const Center(
              child: Icon(LucideIcons.plus,
                  color: AppColors.mutedForeground, size: 28)),
        ),
      ),
    ];
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 3,
      crossAxisSpacing: 8,
      mainAxisSpacing: 8,
      children: items,
    );
  }
}

class _Thumb extends StatelessWidget {
  const _Thumb({required this.child, required this.onRemove});
  final Widget child;
  final VoidCallback onRemove;
  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        ClipRRect(borderRadius: BorderRadius.circular(10), child: child),
        Positioned(
          top: 4,
          right: 4,
          child: GestureDetector(
            onTap: onRemove,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                  color: Colors.black54, shape: BoxShape.circle),
              child: const Icon(Icons.close, color: Colors.white, size: 14),
            ),
          ),
        ),
      ],
    );
  }
}
