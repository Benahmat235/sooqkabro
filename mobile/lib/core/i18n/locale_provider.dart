import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'translations.dart';

enum AppLocale { fr, en, ar }

extension AppLocaleX on AppLocale {
  String get code => switch (this) {
        AppLocale.fr => 'fr',
        AppLocale.en => 'en',
        AppLocale.ar => 'ar',
      };

  String get label => switch (this) {
        AppLocale.fr => 'Français',
        AppLocale.en => 'English',
        AppLocale.ar => 'العربية',
      };

  Locale toLocale() => Locale(code);

  TextDirection get textDirection =>
      this == AppLocale.ar ? TextDirection.rtl : TextDirection.ltr;
}

class LocaleNotifier extends StateNotifier<AppLocale> {
  LocaleNotifier() : super(AppLocale.fr) {
    _load();
  }

  static const _key = 'app_locale';

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_key);
    if (saved != null) {
      state = AppLocale.values.firstWhere(
        (l) => l.code == saved,
        orElse: () => AppLocale.fr,
      );
    }
  }

  Future<void> setLocale(AppLocale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, locale.code);
  }
}

final localeProvider =
    StateNotifierProvider<LocaleNotifier, AppLocale>((ref) => LocaleNotifier());

/// Helper de traduction: `context.t('key')`
extension TranslateX on BuildContext {
  String t(String key) {
    // Le ProviderScope racine injecte la locale; lecture via override Inherited.
    final locale = LocalizationScope.of(this);
    return translations[locale.code]?[key] ??
        translations['fr']?[key] ??
        key;
  }
}

/// Widget qui propage la locale dans le widget tree pour `context.t(...)`.
class LocalizationScope extends InheritedWidget {
  const LocalizationScope({
    super.key,
    required this.locale,
    required super.child,
  });

  final AppLocale locale;

  static AppLocale of(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<LocalizationScope>();
    return scope?.locale ?? AppLocale.fr;
  }

  @override
  bool updateShouldNotify(covariant LocalizationScope oldWidget) =>
      oldWidget.locale != locale;
}
