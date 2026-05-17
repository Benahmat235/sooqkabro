import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/i18n/locale_provider.dart';
import '../../core/supabase/supabase_service.dart';
import '../../core/theme/app_theme.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key, this.redirectTo});
  final String? redirectTo;

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  bool _isLogin = true;
  bool _isReset = false;
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _displayName = TextEditingController();
  bool _loading = false;
  bool _obscure = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _displayName.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    final password = _password.text;
    if (email.isEmpty || (!_isReset && password.isEmpty)) {
      _snack(context.t('auth.fillFields'));
      return;
    }
    if (!_isReset && password.length < 6) {
      _snack(context.t('auth.passwordLength'));
      return;
    }
    setState(() => _loading = true);
    try {
      if (_isReset) {
        await SupabaseService.auth.resetPasswordForEmail(email);
        if (!mounted) return;
        _snack(context.t('auth.emailSent'));
        setState(() => _isReset = false);
      } else if (_isLogin) {
        await SupabaseService.auth.signInWithPassword(
          email: email,
          password: password,
        );
        if (!mounted) return;
        _snack(context.t('auth.loginSuccess'));
        _redirect();
      } else {
        final res = await SupabaseService.auth.signUp(
          email: email,
          password: password,
          data: {
            if (_displayName.text.trim().isNotEmpty)
              'display_name': _displayName.text.trim(),
          },
        );
        if (!mounted) return;
        if (res.session != null) {
          _redirect();
        } else {
          _snack(context.t('auth.checkEmail'));
          setState(() => _isLogin = true);
        }
      }
    } on AuthException catch (e) {
      _snack(e.message);
    } catch (e) {
      _snack(e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _redirect() {
    final to = widget.redirectTo ?? '/';
    if (mounted) context.go(to);
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final title = _isReset
        ? context.t('auth.resetTitle')
        : _isLogin
            ? context.t('auth.welcome')
            : context.t('auth.createAccount');
    final subtitle = _isReset
        ? context.t('auth.resetSubtitle')
        : _isLogin
            ? context.t('auth.loginSubtitle')
            : context.t('auth.createSubtitle');

    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 8),
              Center(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.chadBlue],
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.shopping_bag,
                      color: Colors.white, size: 36),
                ),
              ),
              const SizedBox(height: 18),
              Text(title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.w800)),
              const SizedBox(height: 4),
              Text(subtitle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      color: AppColors.mutedForeground, fontSize: 13)),
              const SizedBox(height: 24),
              if (!_isReset && !_isLogin)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: TextField(
                    controller: _displayName,
                    decoration: InputDecoration(
                      labelText: context.t('auth.displayName'),
                    ),
                  ),
                ),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                decoration: InputDecoration(
                  labelText: context.t('auth.email'),
                ),
              ),
              if (!_isReset) ...[
                const SizedBox(height: 12),
                TextField(
                  controller: _password,
                  obscureText: _obscure,
                  decoration: InputDecoration(
                    labelText: _isLogin
                        ? context.t('auth.password')
                        : context.t('auth.passwordMin'),
                    suffixIcon: IconButton(
                      onPressed: () => setState(() => _obscure = !_obscure),
                      icon: Icon(_obscure
                          ? Icons.visibility
                          : Icons.visibility_off),
                    ),
                  ),
                ),
              ],
              if (_isLogin && !_isReset)
                Align(
                  alignment: AlignmentDirectional.centerEnd,
                  child: TextButton(
                    onPressed: () => setState(() => _isReset = true),
                    child: Text(context.t('auth.forgotLink')),
                  ),
                ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2),
                      )
                    : Text(
                        _isReset
                            ? context.t('auth.sendLink')
                            : _isLogin
                                ? context.t('auth.loginBtn')
                                : context.t('auth.registerBtn'),
                      ),
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => setState(() {
                    if (_isReset) {
                      _isReset = false;
                    } else {
                      _isLogin = !_isLogin;
                    }
                  }),
                  child: Text(
                    _isReset
                        ? context.t('auth.backToLogin')
                        : _isLogin
                            ? '${context.t('auth.noAccount')} ${context.t('auth.signupLink')}'
                            : '${context.t('auth.hasAccount')} ${context.t('auth.loginLink')}',
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
