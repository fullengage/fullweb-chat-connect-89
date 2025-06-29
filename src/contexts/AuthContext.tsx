
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { User } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    console.log('🔧 Setting up auth state listeners...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error)
        setLoading(false)
        return
      }
      
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (session?.user) {
        console.log('✅ Initial session found for user:', session.user.email)
      } else {
        console.log('ℹ️ No initial session found')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Log successful login
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in:', session.user.email)
          
          // Verificar se o usuário existe na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single()
            
          if (userError || !userData) {
            console.error('❌ User not found in users table:', userError)
            toast({
              title: "Erro de autenticação",
              description: "Usuário não encontrado no sistema. Entre em contato com o administrador.",
              variant: "destructive",
            })
            await supabase.auth.signOut()
            return
          }
          
          if (!userData.isactive) {
            console.error('❌ User is inactive:', userData.email)
            toast({
              title: "Conta inativa",
              description: "Sua conta está inativa. Entre em contato com o administrador.",
              variant: "destructive",
            })
            await supabase.auth.signOut()
            return
          }
          
          console.log('✅ User verified:', { 
            id: userData.id, 
            email: userData.email, 
            role: userData.role,
            account_id: userData.account_id
          })
          
          toast({
            title: "Login realizado com sucesso",
            description: `Bem-vindo(a), ${userData.name || userData.email}!`,
          })
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          toast({
            title: "Logout realizado",
            description: "Você foi desconectado com sucesso.",
          })
        }
      }
    )

    return () => {
      console.log('🧹 Cleaning up auth listeners')
      subscription.unsubscribe()
    }
  }, [toast])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting to sign in user:', email)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ Sign in error:', error)
      let errorMessage = 'Erro ao fazer login'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.'
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      })
      
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('📝 Attempting to sign up user:', email)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`
      }
    })
    
    if (error) {
      console.error('❌ Sign up error:', error)
      let errorMessage = 'Erro ao criar conta'
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado'
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres'
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      })
      
      throw error
    }
    
    toast({
      title: "Cadastro realizado",
      description: "Verifique seu email para confirmar a conta.",
    })
  }

  const signOut = async () => {
    console.log('👋 Attempting to sign out user')
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Sign out error:', error)
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      })
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
