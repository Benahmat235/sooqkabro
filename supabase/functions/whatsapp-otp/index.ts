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

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // ─── REGISTER (username + password, phone stored) ───
    if (action === 'register') {
      const { username, password, display_name, phone } = body
      if (!username || !password) {
        return jsonRes({ success: false, message: 'Username et mot de passe requis' }, 400)
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
    return new Response(JSON.stringify({ error: error.message }), {
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
