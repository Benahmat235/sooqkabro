import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Palette de couleurs SooqKabro - inspirée du drapeau du Tchad
/// (bleu profond, or doré sahel, terracotta).
/// Valeurs HSL converties depuis /app/frontend/src/index.css.
class AppColors {
  // Light theme
  static const Color background = Color(0xFFFAF7F2); // hsl(40, 20%, 97%)
  static const Color foreground = Color(0xFF161E2C); // hsl(220, 30%, 12%)
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardForeground = Color(0xFF161E2C);
  static const Color popover = Color(0xFFFFFFFF);

  // Primary - Bleu Sahara (drapeau du Tchad)
  static const Color primary = Color(0xFF1E4FB8); // hsl(218, 72%, 42%)
  static const Color primaryForeground = Color(0xFFFFFFFF);

  // Secondary - Or chaud
  static const Color secondary = Color(0xFFF6B519); // hsl(42, 92%, 52%)
  static const Color secondaryForeground = Color(0xFF161E2C);

  static const Color muted = Color(0xFFE9E5DC); // hsl(35, 15%, 91%)
  static const Color mutedForeground = Color(0xFF595E6A);

  static const Color accent = Color(0xFFE3EAF9); // hsl(218, 60%, 94%)
  static const Color accentForeground = Color(0xFF1B4499);

  static const Color destructive = Color(0xFFD3382C); // hsl(4, 72%, 52%)
  static const Color destructiveForeground = Color(0xFFFFFFFF);

  static const Color border = Color(0xFFE2DCD3);
  static const Color input = Color(0xFFE2DCD3);
  static const Color ring = Color(0xFF1E4FB8);

  // Drapeau Tchad
  static const Color chadBlue = Color(0xFF1E4FB8);
  static const Color chadYellow = Color(0xFFF6B519);
  static const Color chadRed = Color(0xFFD3382C);

  // Sable
  static const Color sand = Color(0xFFEEE7DA);
  static const Color sandDark = Color(0xFFCBC0AA);
  static const Color warmWhite = Color(0xFFFCFAF6);

  static const Color success = Color(0xFF28A266);
  static const Color successForeground = Color(0xFFFFFFFF);

  // Dark theme
  static const Color backgroundDark = Color(0xFF0E121B);
  static const Color foregroundDark = Color(0xFFEFE9DC);
  static const Color cardDark = Color(0xFF161B26);
  static const Color mutedDark = Color(0xFF1F2632);
  static const Color borderDark = Color(0xFF252C3A);
  static const Color primaryDark = Color(0xFF457AE3);
  static const Color accentDark = Color(0xFF1E2E4D);
  static const Color accentForegroundDark = Color(0xFFAABFE7);
}

/// Espacement standard repris des tokens Tailwind.
class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;
  static const double huge = 48;
}

/// Rayon par défaut (radius: 0.75rem dans tailwind.config.ts)
class AppRadius {
  static const double sm = 8;
  static const double md = 10;
  static const double lg = 12;
  static const double xl = 16;
  static const double xxl = 20;
  static const double xxxl = 24;
  static const BorderRadius brSm = BorderRadius.all(Radius.circular(sm));
  static const BorderRadius brMd = BorderRadius.all(Radius.circular(md));
  static const BorderRadius brLg = BorderRadius.all(Radius.circular(lg));
  static const BorderRadius brXl = BorderRadius.all(Radius.circular(xl));
  static const BorderRadius brXxl = BorderRadius.all(Radius.circular(xxl));
}

class AppTheme {
  static ThemeData light() {
    const colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary: AppColors.primary,
      onPrimary: AppColors.primaryForeground,
      secondary: AppColors.secondary,
      onSecondary: AppColors.secondaryForeground,
      error: AppColors.destructive,
      onError: AppColors.destructiveForeground,
      surface: AppColors.card,
      onSurface: AppColors.cardForeground,
      surfaceContainerHighest: AppColors.muted,
      outline: AppColors.border,
    );

    final base = ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.background,
      textTheme: GoogleFonts.interTextTheme().apply(
        bodyColor: AppColors.foreground,
        displayColor: AppColors.foreground,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.foreground,
        elevation: 0,
        scrolledUnderElevation: 1,
        surfaceTintColor: AppColors.background,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.primaryForeground,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: GoogleFonts.inter(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.brLg),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.foreground,
          side: const BorderSide(color: AppColors.border),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: GoogleFonts.inter(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.brLg),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.card,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: AppRadius.brLg,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.brLg,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.brLg,
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        hintStyle: GoogleFonts.inter(
          color: AppColors.mutedForeground,
          fontSize: 14,
        ),
        labelStyle: GoogleFonts.inter(
          color: AppColors.mutedForeground,
          fontSize: 14,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.brLg,
          side: const BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      dividerColor: AppColors.border,
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.muted,
        labelStyle: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: AppColors.foreground,
        ),
        side: BorderSide.none,
        shape: const RoundedRectangleBorder(borderRadius: AppRadius.brXl),
      ),
      iconTheme: const IconThemeData(color: AppColors.foreground, size: 22),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.foreground,
        contentTextStyle: GoogleFonts.inter(color: AppColors.background),
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(borderRadius: AppRadius.brLg),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.card,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.mutedForeground,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
    return base;
  }

  static ThemeData dark() {
    const colorScheme = ColorScheme(
      brightness: Brightness.dark,
      primary: AppColors.primaryDark,
      onPrimary: Colors.white,
      secondary: AppColors.secondary,
      onSecondary: Colors.white,
      error: AppColors.destructive,
      onError: Colors.white,
      surface: AppColors.cardDark,
      onSurface: AppColors.foregroundDark,
      surfaceContainerHighest: AppColors.mutedDark,
      outline: AppColors.borderDark,
    );

    return light().copyWith(
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.backgroundDark,
      cardTheme: CardThemeData(
        color: AppColors.cardDark,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.brLg,
          side: const BorderSide(color: AppColors.borderDark, width: 1),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.backgroundDark,
        foregroundColor: AppColors.foregroundDark,
        elevation: 0,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.foregroundDark,
        ),
      ),
      textTheme: GoogleFonts.interTextTheme().apply(
        bodyColor: AppColors.foregroundDark,
        displayColor: AppColors.foregroundDark,
      ),
      iconTheme: const IconThemeData(color: AppColors.foregroundDark, size: 22),
    );
  }
}
