import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { AwsClient } from 'npm:aws4fetch@1.0.20'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const { filename, contentType, folder } = body as {
      filename?: string
      contentType?: string
      folder?: string
    }

    if (!filename || typeof filename !== 'string' || filename.length > 255) {
      return new Response(JSON.stringify({ error: 'Invalid filename' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!contentType || typeof contentType !== 'string' || contentType.length > 128) {
      return new Response(JSON.stringify({ error: 'Invalid contentType' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')!
    const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')!
    const endpoint = Deno.env.get('R2_ENDPOINT')!.replace(/\/$/, '')
    const bucket = Deno.env.get('R2_BUCKET')!
    const publicBase = Deno.env.get('R2_PUBLIC_URL')!.replace(/\/$/, '')

    // Build a safe unique key
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120)
    const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`
    const safeFolder = (folder || '').replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+|\/+$/g, '')
    const key = safeFolder ? `${safeFolder}/${unique}` : unique

    const aws = new AwsClient({
      accessKeyId,
      secretAccessKey,
      region: 'auto',
      service: 's3',
    })

    const url = new URL(`${endpoint}/${bucket}/${key}?X-Amz-Expires=300`)
    const signed = await aws.sign(
      new Request(url, { method: 'PUT', headers: { 'Content-Type': contentType } }),
      { aws: { signQuery: true } }
    )

    return new Response(
      JSON.stringify({
        uploadUrl: signed.url,
        publicUrl: `${publicBase}/${key}`,
        key,
        contentType,
        expiresIn: 300,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err) {
    console.error('upload-to-r2 error', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})