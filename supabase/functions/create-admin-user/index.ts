
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
    console.log('User data:', { ...userData, accountId: userData.accountId })

    // First, check if user with this email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log('User already exists with email:', email)
      return new Response(
        JSON.stringify({ error: 'Usuário com este email já existe' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create auth user first
    console.log('Creating auth user...')
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
      console.error('Auth error details:', authError)
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário de autenticação: ${authError.message}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('Auth user created successfully:', authData.user?.id)

    // Now create the user record in public.users table
    console.log('Creating user record...')
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
      console.error('User record error details:', userError)
      
      // If user record creation fails, try to delete the auth user
      try {
        console.log('Cleaning up auth user due to user record error...')
        await supabase.auth.admin.deleteUser(authData.user?.id || '')
        console.log('Auth user cleaned up successfully')
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
        message: 'Usuário admin criado com sucesso',
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          name: userData.name
        },
        userRecord: userRecord
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Unexpected error details:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
