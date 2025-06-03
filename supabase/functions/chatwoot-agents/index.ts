
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    const { account_id } = await req.json()

    const chatwootToken = Deno.env.get('CHATWOOT_API_TOKEN')
    if (!chatwootToken) {
      throw new Error('Chatwoot API token not configured')
    }

    const chatwootUrl = `https://app.chatwoot.com/api/v1/accounts/${account_id}/agents`
    
    console.log('Fetching agents from:', chatwootUrl)

    const response = await fetch(chatwootUrl, {
      headers: {
        'api_access_token': chatwootToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Chatwoot API error: ${response.status} ${response.statusText}`)
    }

    const agents = await response.json()
    console.log('Fetched agents:', agents.length)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: agents 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error fetching agents:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
