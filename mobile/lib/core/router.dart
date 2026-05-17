import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/supabase/supabase_service.dart';
import '../screens/account/account_screen.dart';
import '../screens/admin/admin_screen.dart';
import '../screens/auth/auth_screen.dart';
import '../screens/auth/reset_password_screen.dart';
import '../screens/category/category_screen.dart';
import '../screens/favorites/favorites_screen.dart';
import '../screens/home/discover_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/home/shell_screen.dart';
import '../screens/listing/edit_listing_screen.dart';
import '../screens/listing/listing_detail_screen.dart';
import '../screens/listing/my_listings_screen.dart';
import '../screens/messages/conversation_screen.dart';
import '../screens/messages/messages_screen.dart';
import '../screens/publish/publish_screen.dart';
import '../screens/search/search_screen.dart';
import '../screens/seller/seller_profile_screen.dart';

final _rootKey = GlobalKey<NavigatorState>();
final _shellKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/',
    redirect: (context, state) {
      final user = SupabaseService.currentUser;
      final loc = state.matchedLocation;
      // Protect specific routes
      final protectedPrefix = ['/publish', '/messages', '/favorites',
          '/account', '/my-listings', '/admin', '/edit'];
      final isProtected =
          protectedPrefix.any((p) => loc.startsWith(p));
      if (isProtected && user == null) {
        return '/auth?redirect=${Uri.encodeComponent(loc)}';
      }
      return null;
    },
    routes: [
      ShellRoute(
        navigatorKey: _shellKey,
        builder: (context, state, child) => ShellScreen(child: child),
        routes: [
          GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
          GoRoute(
              path: '/discover', builder: (_, __) => const DiscoverScreen()),
          GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
          GoRoute(
              path: '/favorites',
              builder: (_, __) => const FavoritesScreen()),
          GoRoute(
              path: '/messages',
              builder: (_, __) => const MessagesScreen()),
          GoRoute(path: '/account', builder: (_, __) => const AccountScreen()),
        ],
      ),
      GoRoute(
        path: '/auth',
        builder: (context, state) => AuthScreen(
          redirectTo: state.uri.queryParameters['redirect'],
        ),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (_, __) => const ResetPasswordScreen(),
      ),
      GoRoute(
        path: '/publish',
        builder: (_, __) => const PublishScreen(),
      ),
      GoRoute(
        path: '/category/:id',
        builder: (context, state) =>
            CategoryScreen(categoryId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/listing/:id',
        builder: (context, state) =>
            ListingDetailScreen(listingId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/edit/:id',
        builder: (context, state) =>
            EditListingScreen(listingId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/my-listings',
        builder: (_, __) => const MyListingsScreen(),
      ),
      GoRoute(
        path: '/seller/:id',
        builder: (context, state) =>
            SellerProfileScreen(sellerId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/conversation/:id',
        builder: (context, state) =>
            ConversationScreen(conversationId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/admin', builder: (_, __) => const AdminScreen()),
    ],
  );
});
