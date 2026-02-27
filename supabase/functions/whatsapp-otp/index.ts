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

    // ─── USERNAME + PASSWORD AUTH ───
    if (action === 'register') {
      const { username, password, display_name } = body
      if (!username || !password) {
        return new Response(JSON.stringify({ success: false, message: 'Username et mot de passe requis' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Check if username already taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (existing) {
        return new Response(JSON.stringify({ success: false, message: 'Ce nom d\'utilisateur est déjà pris' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@user.tchadmarket.local`

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: display_name || username, username },
      })

      if (createError) {
        if (createError.message?.includes('already been registered')) {
          return new Response(JSON.stringify({ success: false, message: 'Ce nom d\'utilisateur est déjà pris' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        throw createError
      }

      // Update profile with username
      await supabase.from('profiles').update({ 
        username, 
        display_name: display_name || username 
      }).eq('id', newUser.user.id)

      // Sign in the new user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      return new Response(JSON.stringify({ 
        success: true, 
        session: signInData.session,
        user: signInData.user,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'login') {
      const { username, password } = body
      if (!username || !password) {
        return new Response(JSON.stringify({ success: false, message: 'Username et mot de passe requis' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Find user by username
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (!profile) {
        return new Response(JSON.stringify({ success: false, message: 'Utilisateur non trouvé' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
      if (!userData?.user?.email) {
        return new Response(JSON.stringify({ success: false, message: 'Compte introuvable' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password,
      })

      if (signInError) {
        return new Response(JSON.stringify({ success: false, message: 'Mot de passe incorrect' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        session: signInData.session,
        user: signInData.user,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── OTP AUTH (WhatsApp or SMS) ───
    if (action === 'send') {
      const { phone, channel = 'whatsapp' } = body

      const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')?.trim()
      const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')?.trim()
      const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM')?.trim()

      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
        throw new Error('Twilio credentials not configured')
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

      const { error: insertError } = await supabase
        .from('otp_codes')
        .insert({ phone, code: otpCode })
      if (insertError) throw insertError

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
      
      const fromNumber = channel === 'sms' 
        ? TWILIO_WHATSAPP_FROM 
        : `whatsapp:${TWILIO_WHATSAPP_FROM}`
      
      const toNumber = channel === 'sms' 
        ? phone 
        : `whatsapp:${phone}`

      const msgBody = new URLSearchParams({
        From: fromNumber,
        To: toNumber,
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

      return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'verify') {
      const { phone, code, display_name } = body

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
        return new Response(JSON.stringify({ success: false, message: 'Code invalide ou expiré' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      await supabase.from('otp_codes').update({ verified: true }).eq('id', otpData.id)

      // Find or create user
      const email = `${phone.replace(/[^0-9]/g, '')}@phone.tchadmarket.local`
      const password = crypto.randomUUID()

      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.phone === phone || u.email === email)

      let session = null

      if (existingUser) {
        // Reset password and sign in
        await supabase.auth.admin.updateUser(existingUser.id, { password })
        const { data: signInData } = await supabase.auth.signInWithPassword({ email: existingUser.email!, password })
        session = signInData?.session
      } else {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          phone,
          password,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: { display_name: display_name || '', phone },
        })
        if (createError) throw createError

        const { data: signInData } = await supabase.auth.signInWithPassword({ email, password })
        session = signInData?.session
      }

      return new Response(JSON.stringify({ 
        success: true, 
        session,
        needsName: !existingUser,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
