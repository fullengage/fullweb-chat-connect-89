
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { email, password, userData } = await req.json()

    console.log('Creating admin user with email:', email)

    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('Auth user created successfully:', authData.user?.id)

    // Now create the user record in public.users table
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user?.id,
        account_id: userData.accountId,
        name: userData.name,
        email: email,
        phone: userData.phone || null,
        role: 'admin',
        isactive: true
      })
      .select()
      .single()

    if (userError) {
      console.error('User record error:', userError)
      
      // If user record creation fails, try to delete the auth user
      try {
        await supabase.auth.admin.deleteUser(authData.user?.id || '')
      } catch (deleteError) {
        console.error('Error cleaning up auth user:', deleteError)
      }
      
      return new Response(
        JSON.stringify({ error: `Erro ao criar registro do usuário: ${userError.message}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('User record created successfully:', userRecord)

    return new Response(
      JSON.stringify({ 
        success: true,
        user: authData.user,
        userRecord: userRecord
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
