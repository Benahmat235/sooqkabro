import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../core/supabase/supabase_service.dart';
import '../models/profile.dart';

/// Stream d'état d'auth Supabase.
final authStateProvider = StreamProvider<AuthState>((ref) {
  return SupabaseService.auth.onAuthStateChange;
});

/// Utilisateur courant (peut être null).
final currentUserProvider = Provider<User?>((ref) {
  ref.watch(authStateProvider);
  return SupabaseService.currentUser;
});

/// Profile complet (depuis la table profiles).
final currentProfileProvider = FutureProvider<Profile?>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;
  final res = await SupabaseService.client
      .from('profiles')
      .select()
      .eq('id', user.id)
      .maybeSingle();
  if (res == null) return null;
  return Profile.fromMap(Map<String, dynamic>.from(res));
});
