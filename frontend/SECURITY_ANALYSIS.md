# Security Analysis Report - SooqKabro Marketplace

## Executive Summary

This document provides a comprehensive security analysis of the SooqKabro marketplace application, identifying vulnerabilities, assessing risks, and providing remediation recommendations.

---

## 1. Authentication & Authorization

### Current Implementation
- **Provider**: Supabase Auth with email/password, Google OAuth, and Apple OAuth
- **Session Management**: JWT-based with automatic refresh tokens
- **Role System**: `app_role` enum with `admin`, `moderator`, `user` roles

### Vulnerabilities Identified

#### HIGH RISK
1. **Missing Email Verification Enforcement**
   - Users can sign up without verifying their email
   - **Impact**: Potential for fake accounts, spam listings
   - **Remediation**: Enforce `email_confirmed_at` check before allowing listing creation

2. **No Rate Limiting on Authentication**
   - Login/register endpoints lack rate limiting
   - **Impact**: Brute force attacks possible
   - **Remediation**: Implement rate limiting via Supabase Edge Functions or middleware

#### MEDIUM RISK
3. **Password Policy Too Weak**
   - Only 6-character minimum enforced
   - **Impact**: Easy password guessing
   - **Remediation**: Require 8+ chars, mixed case, numbers, special characters

4. **No Session Invalidation on Password Change**
   - Changing password doesn't invalidate existing sessions
   - **Impact**: Compromised sessions remain active
   - **Remediation**: Call `supabase.auth.signOut({ scope: 'global' })` on password change

---

## 2. Database Security (Row Level Security)

### Current RLS Status

| Table | RLS Enabled | Policies | Risk Level |
|-------|-------------|----------|------------|
| `listings` | Unknown | Needs verification | MEDIUM |
| `messages` | YES | Comprehensive | LOW |
| `conversations` | YES | Comprehensive | LOW |
| `profiles` | Unknown | Needs verification | HIGH |
| `favorites` | Unknown | Needs verification | MEDIUM |
| `seller_reviews` | Unknown | Needs verification | MEDIUM |
| `otp_codes` | Unknown | Needs verification | CRITICAL |
| `user_roles` | Unknown | Needs verification | CRITICAL |

### Critical Issues

#### CRITICAL
1. **`otp_codes` Table Exposure**
   - If RLS not enabled, OTP codes could be read by any authenticated user
   - **Impact**: Account takeover via OTP theft
   - **Remediation**: 
   ```sql
   ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can only access their own OTP codes"
   ON public.otp_codes FOR ALL
   USING (phone = (SELECT phone FROM profiles WHERE id = auth.uid()));
   ```

2. **`user_roles` Table Access**
   - Admin role assignments must be protected
   - **Impact**: Privilege escalation
   - **Remediation**:
   ```sql
   ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Only admins can manage roles"
   ON public.user_roles FOR ALL
   USING (
     EXISTS (
       SELECT 1 FROM user_roles 
       WHERE user_id = auth.uid() AND role = 'admin'
     )
   );
   CREATE POLICY "Users can view their own roles"
   ON public.user_roles FOR SELECT
   USING (user_id = auth.uid());
   ```

#### HIGH RISK
3. **`profiles` Table - Phone Number Exposure**
   - Phone numbers may be accessible to all users
   - **Impact**: Privacy violation, spam
   - **Remediation**: Restrict phone visibility to conversation participants

4. **`listings` Owner Verification**
   - Ensure only owners can update/delete their listings
   - **Remediation**:
   ```sql
   CREATE POLICY "Users can update their own listings"
   ON public.listings FOR UPDATE
   USING (user_id = auth.uid());
   ```

---

## 3. Real-time Data Security

### Current Status
- RLS policies exist in `scripts/add-realtime-rls-policies.sql` but may not be applied
- Messages table has proper policies defined

### Issues

#### HIGH RISK
1. **Realtime Subscription Leakage**
   - Without RLS, users can subscribe to any channel
   - **Impact**: Reading private conversations
   - **Remediation**: Execute the RLS script and verify in Supabase Dashboard

2. **Missing Broadcast Authorization**
   - Custom realtime channels need authorization checks
   - **Remediation**: Use private channels with RLS-filtered data

### Recommended Actions
```sql
-- Verify RLS is enabled for realtime
ALTER PUBLICATION supabase_realtime SET (publish = 'insert, update, delete');

-- Enable RLS on all tables that use realtime
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
```

---

## 4. Input Validation & Sanitization

### Vulnerabilities

#### MEDIUM RISK
1. **XSS in Listing Content**
   - User-generated content (titles, descriptions) not sanitized
   - **Impact**: Script injection in listing pages
   - **Remediation**: Use DOMPurify or similar for HTML sanitization

2. **SQL Injection Prevention**
   - Supabase client uses parameterized queries (GOOD)
   - Verify no raw SQL in Edge Functions

3. **File Upload Validation Missing**
   - Image uploads may not validate file types server-side
   - **Impact**: Malicious file uploads
   - **Remediation**: Validate MIME types in storage policies

### Recommendations
```typescript
// Add input sanitization utility
import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

---

## 5. API Security

### Current Architecture
- Client directly calls Supabase
- Edge Functions for admin operations (`admin-merchants`)

### Issues

#### MEDIUM RISK
1. **Exposed Supabase Keys in Client**
   - `VITE_SUPABASE_PUBLISHABLE_KEY` is public (expected)
   - Ensure no service role key in client code

2. **Edge Function Authorization**
   - `admin-merchants` checks session but should verify admin role server-side
   - **Remediation**: Add role verification in Edge Function

3. **Missing API Rate Limiting**
   - No protection against API abuse
   - **Remediation**: Implement rate limiting in Edge Functions

---

## 6. Data Privacy & GDPR Compliance

### Issues

#### HIGH RISK
1. **Phone Number Handling**
   - Phone numbers stored in plaintext
   - Visible in listings and profiles
   - **Impact**: Privacy violation
   - **Remediation**: 
     - Mask phone numbers in public APIs
     - Reveal only to conversation participants

2. **No Data Export/Deletion**
   - Missing GDPR Article 17 (Right to Erasure) implementation
   - **Remediation**: Add account deletion feature

3. **Missing Privacy Policy**
   - No visible privacy policy or terms of service
   - **Remediation**: Add legal pages

### Recommendations
```typescript
// Phone masking utility
export function maskPhone(phone: string): string {
  return phone.slice(0, 3) + '****' + phone.slice(-2);
}
```

---

## 7. Session Security

### Current Implementation
- Sessions stored in localStorage
- Auto-refresh enabled
- Persistent sessions

### Issues

#### MEDIUM RISK
1. **localStorage Token Storage**
   - Vulnerable to XSS attacks
   - **Impact**: Session hijacking
   - **Recommendation**: Consider httpOnly cookies for sensitive apps

2. **No Session Activity Monitoring**
   - No alerts for suspicious login activity
   - **Remediation**: Implement login history and notifications

---

## 8. Recommended Security Migrations

### Priority 1: Critical (Immediate)

```sql
-- 1. Secure OTP codes table
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "otp_phone_policy" ON public.otp_codes;
CREATE POLICY "otp_phone_policy" ON public.otp_codes
FOR ALL USING (
  phone = (SELECT phone FROM public.profiles WHERE id = auth.uid())
);

-- 2. Secure user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_roles" ON public.user_roles
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "view_own_roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- 3. Secure profiles phone access
DROP POLICY IF EXISTS "public_profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
FOR SELECT USING (true); -- Public profile info

CREATE POLICY "profiles_phone_restricted" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE (buyer_id = auth.uid() AND seller_id = profiles.id)
       OR (seller_id = auth.uid() AND buyer_id = profiles.id)
  )
);
```

### Priority 2: High (Within 1 Week)

```sql
-- 4. Secure listings table
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_select_published" ON public.listings
FOR SELECT USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "listings_insert" ON public.listings
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "listings_update" ON public.listings
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "listings_delete" ON public.listings
FOR DELETE USING (user_id = auth.uid());

-- 5. Secure favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_user" ON public.favorites
FOR ALL USING (user_id = auth.uid());

-- 6. Secure seller_reviews
ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select" ON public.seller_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.seller_reviews
FOR INSERT WITH CHECK (reviewer_id = auth.uid() AND seller_id != auth.uid());
CREATE POLICY "reviews_update" ON public.seller_reviews
FOR UPDATE USING (reviewer_id = auth.uid());
```

### Priority 3: Medium (Within 1 Month)

```sql
-- 7. Secure listing_images
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listing_images_select" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "listing_images_modify" ON public.listing_images
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid())
);

-- 8. Secure listing_views
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "views_insert" ON public.listing_views FOR INSERT WITH CHECK (true);
CREATE POLICY "views_select" ON public.listing_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid())
);
```

---

## 9. Security Checklist

### Authentication
- [ ] Enforce email verification before listing creation
- [ ] Implement strong password policy (8+ chars, complexity)
- [ ] Add rate limiting on auth endpoints
- [ ] Invalidate sessions on password change
- [ ] Add 2FA option for high-value accounts

### Database
- [ ] Enable RLS on ALL tables
- [ ] Verify all RLS policies in Supabase Dashboard
- [ ] Test policies with different user roles
- [ ] Audit direct table access permissions

### API
- [ ] Verify no service role key in client
- [ ] Add rate limiting to Edge Functions
- [ ] Validate admin role server-side
- [ ] Log security events

### Data Privacy
- [ ] Mask phone numbers in public APIs
- [ ] Implement account deletion
- [ ] Add privacy policy page
- [ ] Enable audit logging

### Client Security
- [ ] Sanitize all user inputs
- [ ] Implement CSP headers
- [ ] Add XSS protection
- [ ] Validate file uploads

---

## 10. Monitoring & Incident Response

### Recommended Monitoring
1. **Failed Login Attempts**: Alert on 5+ failures per IP
2. **Unusual API Patterns**: Detect scraping/abuse
3. **Admin Actions**: Log all role changes
4. **Data Export Requests**: Track and audit

### Incident Response Plan
1. **Detection**: Monitor Supabase logs and alerts
2. **Containment**: Ability to quickly disable user accounts
3. **Eradication**: Clear compromised sessions
4. **Recovery**: Restore from backups if needed
5. **Post-Incident**: Document and improve

---

## Conclusion

The application has a solid foundation with Supabase Auth and existing RLS policies for messages/conversations. However, critical improvements are needed:

1. **Immediate**: Secure `otp_codes` and `user_roles` tables
2. **High Priority**: Complete RLS coverage for all tables
3. **Ongoing**: Input validation, privacy compliance, monitoring

Implementing these recommendations will significantly improve the security posture of the SooqKabro marketplace.
