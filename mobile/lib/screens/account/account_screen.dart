import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/supabase/supabase_service.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_providers.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final profileAsync = ref.watch(currentProfileProvider);

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: Text(context.t('nav.account'))),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.userCircle2,
                  size: 80, color: AppColors.mutedForeground),
              const SizedBox(height: 16),
              Text(context.t('account.welcome'),
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text(context.t('account.loginPrompt'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.mutedForeground)),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.push('/auth'),
                  child: Text(context.t('auth.loginBtn')),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(context.t('nav.account'))),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (profile) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: AppColors.muted,
                  backgroundImage: profile?.avatarUrl != null
                      ? NetworkImage(profile!.avatarUrl!)
                      : null,
                  child: profile?.avatarUrl == null
                      ? const Icon(Icons.person,
                          size: 30, color: AppColors.mutedForeground)
                      : null,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        profile?.effectiveName ??
                            (user.email ?? context.t('account.welcome')),
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 17),
                      ),
                      const SizedBox(height: 4),
                      Text(user.email ?? '',
                          style: const TextStyle(
                              color: AppColors.mutedForeground, fontSize: 13)),
                    ],
                  ),
                ),
                if (profile?.isVerified == true)
                  const Icon(Icons.verified, color: AppColors.primary, size: 22),
              ],
            ),
            const SizedBox(height: 24),
            _MenuItem(
              icon: LucideIcons.list,
              label: context.t('account.myListings'),
              onTap: () => context.push('/my-listings'),
            ),
            _MenuItem(
              icon: LucideIcons.heart,
              label: context.t('account.myFavorites'),
              onTap: () => context.go('/favorites'),
            ),
            _MenuItem(
              icon: LucideIcons.messageCircle,
              label: context.t('nav.messages'),
              onTap: () => context.go('/messages'),
            ),
            _MenuItem(
              icon: LucideIcons.globe,
              label: 'Langue / Language / اللغة',
              onTap: () => _showLocalePicker(context, ref),
            ),
            _MenuItem(
              icon: LucideIcons.shield,
              label: context.t('account.admin'),
              onTap: () => context.push('/admin'),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.destructive,
              ),
              onPressed: () async {
                await SupabaseService.auth.signOut();
                if (context.mounted) context.go('/');
              },
              icon: const Icon(LucideIcons.logOut),
              label: Text(context.t('account.logout')),
            ),
          ],
        ),
      ),
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

class _MenuItem extends StatelessWidget {
  const _MenuItem(
      {required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.accent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppColors.primary, size: 18),
        ),
        title: Text(label,
            style: const TextStyle(fontWeight: FontWeight.w600)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.mutedForeground),
        onTap: onTap,
      ),
    );
  }
}
