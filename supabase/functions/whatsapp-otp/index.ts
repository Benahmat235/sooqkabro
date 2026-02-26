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
    const { action, phone, code, display_name } = await req.json()

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')?.trim()
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')?.trim()
    const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM')?.trim()
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
      throw new Error('Twilio credentials not configured')
    }

    if (!TWILIO_ACCOUNT_SID.startsWith('AC')) {
      throw new Error('Invalid TWILIO_ACCOUNT_SID: must start with AC')
    }

    if (TWILIO_AUTH_TOKEN.length < 10) {
      throw new Error('Invalid TWILIO_AUTH_TOKEN: token looks too short')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (action === 'send') {
      // Generate 6-digit code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

      // Store OTP
      const { error: insertError } = await supabase
        .from('otp_codes')
        .insert({ phone, code: otpCode })

      if (insertError) throw insertError

      // Send via Twilio WhatsApp
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
      const body = new URLSearchParams({
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
        body: body.toString(),
      })

      if (!twilioRes.ok) {
        const errData = await twilioRes.text()
        console.error('Twilio error:', errData)
        throw new Error(`Failed to send WhatsApp message: ${twilioRes.status}`)
      }

      return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'verify') {
      // Check OTP
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
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Mark as verified
      await supabase.from('otp_codes').update({ verified: true }).eq('id', otpData.id)

      // Check if user exists with this phone
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.phone === phone)

      let session = null

      if (existingUser) {
        // Sign in existing user - generate a session
        const { data, error } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: `${phone.replace(/\+/g, '')}@phone.tchadmarket.local`,
        })
        
        // Use signInWithPassword with a deterministic password based on the phone
        // Actually, better approach: use admin to update and then sign in
        const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
          type: 'magiclink', 
          email: existingUser.email!,
        })

        // Create a custom session token
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.createUser({
          email: existingUser.email,
          email_confirm: true,
        }).catch(() => ({ data: null, error: null }))

        // Better: just return a signed token
        // Use the admin API to get a session for the user
        const { data: tokenData, error: tokenError } = await (supabase.auth.admin as any).generateLink({
          type: 'magiclink',
          email: existingUser.email!,
        })

        session = { user: existingUser, token: tokenData }
      } else {
        // Create new user
        const email = `${phone.replace(/[^0-9]/g, '')}@phone.tchadmarket.local`
        const password = crypto.randomUUID()
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          phone,
          password,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: { display_name: display_name || '', phone },
        })

        if (createError) throw createError

        // Generate session for new user
        const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email,
        })

        session = { user: newUser.user, token: signInData }
      }

      return new Response(JSON.stringify({ success: true, session }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
