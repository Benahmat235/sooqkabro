class Profile {
  Profile({
    required this.id,
    this.displayName,
    this.username,
    this.phone = '',
    this.avatarUrl,
    this.bio,
    this.isVerified = false,
    this.createdAt,
  });

  final String id;
  final String? displayName;
  final String? username;
  final String phone;
  final String? avatarUrl;
  final String? bio;
  final bool isVerified;
  final DateTime? createdAt;

  factory Profile.fromMap(Map<String, dynamic> map) {
    return Profile(
      id: map['id'] as String,
      displayName: map['display_name'] as String?,
      username: map['username'] as String?,
      phone: (map['phone'] ?? '') as String,
      avatarUrl: map['avatar_url'] as String?,
      bio: map['bio'] as String?,
      isVerified: (map['is_verified'] ?? false) as bool,
      createdAt: map['created_at'] != null
          ? DateTime.tryParse(map['created_at'].toString())
          : null,
    );
  }

  String get effectiveName {
    if (displayName != null && displayName!.isNotEmpty) return displayName!;
    if (username != null && username!.isNotEmpty) return username!;
    return 'Utilisateur';
  }
}
