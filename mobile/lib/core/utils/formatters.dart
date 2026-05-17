import 'package:intl/intl.dart';

class Formatters {
  static final NumberFormat _currency =
      NumberFormat.decimalPattern('fr_FR');

  static String price(num? value) {
    if (value == null || value <= 0) return 'Gratuit';
    return '${_currency.format(value)} FCFA';
  }

  static String compactNumber(num value) {
    if (value >= 1000000) {
      return '${(value / 1000000).toStringAsFixed(1)}M';
    }
    if (value >= 1000) return '${(value / 1000).toStringAsFixed(1)}k';
    return value.toString();
  }
}
