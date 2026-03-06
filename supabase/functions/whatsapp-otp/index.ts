import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action } = body

    // ─── Input validation helpers ───
    const isValidUsername = (u: string) => typeof u === 'string' && /^[a-zA-Z0-9_]{3,30}$/.test(u)
    const isValidPhone = (p: string) => typeof p === 'string' && /^\+?235?\d{8}$/.test(p.replace(/\s/g, ''))
    const isValidOTP = (c: string) => typeof c === 'string' && /^\d{6}$/.test(c)
    const isValidPassword = (p: string) => typeof p === 'string' && p.length >= 6 && p.length <= 128

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // ─── REGISTER (username + password, phone stored) ───
    if (action === 'register') {
      const { username, password, display_name, phone } = body
      if (!username || !password) {
        return jsonRes({ success: false, message: 'Username et mot de passe requis' }, 400)
      }
      if (!isValidUsername(username)) {
        return jsonRes({ success: false, message: "Nom d'utilisateur invalide (3-30 caractères, lettres/chiffres/_)" }, 400)
      }
      if (!isValidPassword(password)) {
        return jsonRes({ success: false, message: 'Mot de passe invalide (6-128 caractères)' }, 400)
      }
      if (phone && !isValidPhone(phone)) {
        return jsonRes({ success: false, message: 'Numéro de téléphone invalide' }, 400)
      }

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .maybeSingle()

      if (existing) {
        return jsonRes({ success: false, message: "Ce nom d'utilisateur est déjà pris" }, 400)
      }

      const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@user.tchadmarket.local`

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: display_name || username, username, phone: phone || '' },
      })

      if (createError) {
        if (createError.message?.includes('already been registered')) {
          return jsonRes({ success: false, message: "Ce nom d'utilisateur est déjà pris" }, 400)
        }
        throw createError
      }

      await supabase.from('profiles').update({
        username,
        display_name: display_name || username,
        phone: phone || '',
      }).eq('id', newUser.user.id)

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      return jsonRes({ success: true, session: signInData.session, user: signInData.user })
    }

    // ─── LOGIN (username + password) ───
    if (action === 'login') {
      const { username, password } = body
      if (!username || !password) {
        return jsonRes({ success: false, message: 'Username et mot de passe requis' }, 400)
      }
      if (!isValidUsername(username)) {
        return jsonRes({ success: false, message: "Nom d'utilisateur invalide" }, 400)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .maybeSingle()

      if (!profile) {
        return jsonRes({ success: false, message: 'Utilisateur non trouvé' }, 400)
      }

      const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
      if (!userData?.user?.email) {
        return jsonRes({ success: false, message: 'Compte introuvable' }, 400)
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password,
      })

      if (signInError) {
        return jsonRes({ success: false, message: 'Mot de passe incorrect' }, 400)
      }

      return jsonRes({ success: true, session: signInData.session, user: signInData.user })
    }

    // ─── SEND OTP (WhatsApp only) ───
    if (action === 'send') {
      const { phone } = body
      if (!phone || !isValidPhone(phone)) {
        return jsonRes({ success: false, message: 'Numéro de téléphone invalide' }, 400)
      }

      // Rate limiting: max 3 OTPs per phone per 5 minutes
      const { count } = await supabase
        .from('otp_codes')
        .select('id', { count: 'exact', head: true })
        .eq('phone', phone)
        .gt('created_at', new Date(Date.now() - 5 * 60_000).toISOString())

      if ((count ?? 0) >= 3) {
        return jsonRes({ success: false, message: 'Trop de tentatives. Réessayez dans 5 minutes.' }, 429)
      }

      const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')?.trim()
      const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')?.trim()
      const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM')?.trim()

      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
        throw new Error('Twilio credentials not configured')
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

      const { error: insertError } = await supabase.from('otp_codes').insert({ phone, code: otpCode })
      if (insertError) throw insertError

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`

      const msgBody = new URLSearchParams({
        From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
        To: `whatsapp:${phone}`,
        Body: `Votre code de vérification TchadMarket est : ${otpCode}. Il expire dans 5 minutes.`,
      })

      const twilioRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: msgBody.toString(),
      })

      if (!twilioRes.ok) {
        const errData = await twilioRes.text()
        console.error('Twilio error:', errData)
        throw new Error(`Échec de l'envoi du message: ${twilioRes.status}`)
      }

      return jsonRes({ success: true, message: 'OTP sent via WhatsApp' })
    }

    // ─── VERIFY OTP ONLY (no account creation) ───
    if (action === 'verify_only') {
      const { phone, code } = body
      if (!phone || !isValidPhone(phone) || !code || !isValidOTP(code)) {
        return jsonRes({ success: false, message: 'Téléphone ou code invalide' }, 400)
      }

      const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (otpError || !otpData) {
        return jsonRes({ success: false, message: 'Code invalide ou expiré' }, 400)
      }

      await supabase.from('otp_codes').update({ verified: true }).eq('id', otpData.id)

      return jsonRes({ success: true })
    }

    // ─── RESET PASSWORD (verify OTP + update password) ───
    if (action === 'reset_password') {
      const { phone, code, username, new_password } = body

      if (!username || !new_password || !phone || !code) {
        return jsonRes({ success: false, message: 'Tous les champs sont requis' }, 400)
      }
      if (!isValidUsername(username) || !isValidPhone(phone) || !isValidOTP(code) || !isValidPassword(new_password)) {
        return jsonRes({ success: false, message: 'Données invalides' }, 400)
      }

      // Verify OTP
      const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (otpError || !otpData) {
        return jsonRes({ success: false, message: 'Code invalide ou expiré' }, 400)
      }

      await supabase.from('otp_codes').update({ verified: true }).eq('id', otpData.id)

      // Find user by username
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, phone')
        .ilike('username', username)
        .maybeSingle()

      if (!profile) {
        return jsonRes({ success: false, message: 'Utilisateur non trouvé' }, 400)
      }

      // Verify phone matches the profile
      if (profile.phone !== phone) {
        return jsonRes({ success: false, message: 'Le numéro ne correspond pas au compte' }, 400)
      }

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUser(profile.id, { password: new_password })
      if (updateError) throw updateError

      // Sign in
      const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
      if (!userData?.user?.email) {
        return jsonRes({ success: false, message: 'Compte introuvable' }, 400)
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: new_password,
      })

      if (signInError) throw signInError

      return jsonRes({ success: true, session: signInData.session })
    }

    return jsonRes({ error: 'Invalid action' }, 400)
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Une erreur est survenue. Veuillez réessayer.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function jsonRes(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
