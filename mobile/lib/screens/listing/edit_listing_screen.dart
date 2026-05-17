import 'package:flutter/material.dart';

import '../publish/publish_screen.dart';

class EditListingScreen extends StatelessWidget {
  const EditListingScreen({super.key, required this.listingId});
  final String listingId;

  @override
  Widget build(BuildContext context) {
    return PublishScreen(editingId: listingId);
  }
}
