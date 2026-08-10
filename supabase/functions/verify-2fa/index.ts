import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import * as OTPAuth from 'npm:otpauth@9'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

    const anon = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await anon.auth.getClaims(token)
    if (claimsError || !claimsData?.claims?.sub) return json({ error: 'Unauthorized' }, 401)
    const userId = claimsData.claims.sub as string

    let body: { code?: unknown; type?: unknown }
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const type = body.type === 'backup' ? 'backup' : 'totp'
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    const validFormat = type === 'totp' ? /^\d{6}$/.test(code) : /^[A-Za-z0-9]{6,16}$/.test(code)
    if (!validFormat) return json({ error: 'Code invalide' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let verified = false

    if (type === 'backup') {
      const { data, error } = await admin.rpc('internal_consume_backup_code', {
        p_user_id: userId,
        p_code: code,
      })
      if (error) {
        console.error('backup code verification failed', error.message)
        return json({ error: 'Vérification impossible' }, 500)
      }
      verified = data === true
    } else {
      const { data, error } = await admin.rpc('internal_get_totp_material', { p_user_id: userId })
      if (error) {
        console.error('totp material fetch failed', error.message)
        return json({ error: 'Vérification impossible' }, 500)
      }
      const secret = Array.isArray(data) ? data[0]?.secret : (data as { secret?: string } | null)?.secret
      if (!secret) return json({ error: '2FA non configurée' }, 400)

      const totp = new OTPAuth.TOTP({
        issuer: 'Hala Madrid TV',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret,
      })
      verified = totp.validate({ token: code, window: 1 }) !== null
    }

    if (!verified) return json({ verified: false }, 200)

    const { data: expiresAt, error: recordError } = await admin.rpc('internal_record_2fa_verification', {
      p_user_id: userId,
      p_ttl_minutes: 480,
    })
    if (recordError) {
      console.error('recording 2fa verification failed', recordError.message)
      return json({ error: 'Vérification impossible' }, 500)
    }

    return json({ verified: true, expires_at: expiresAt })
  } catch (e) {
    console.error('verify-2fa error', e instanceof Error ? e.message : 'unknown')
    return json({ error: 'Erreur interne' }, 500)
  }
})