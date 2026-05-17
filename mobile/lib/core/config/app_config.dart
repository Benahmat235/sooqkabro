/// Environnement de configuration de l'application.
///
/// Les clés Supabase sont également présentes dans le code Web sous /app/frontend/.env
/// (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). Nous les recopions ici afin
/// que l'application mobile partage strictement le même backend.
class AppConfig {
  static const String supabaseUrl =
      'https://bwvtfosrbbkawieanrjd.supabase.co';

  static const String supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dnRmb3NyYmJrYXdpZWFucmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzM0MDcsImV4cCI6MjA4NzU0OTQwN30.x0RznmdE04Jn5RskeBfCslYk4sIFUVYU8UcDBV2hP00';

  static const String appName = 'SooqKabro';
  static const String storageBucket = 'listings';
}
