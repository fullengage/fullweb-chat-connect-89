
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/NewAuthContext'

export interface UserProfile {
  id: string
  account_id: number | null
  role: 'superadmin' | 'admin' | 'agent' | 'cliente'
  name: string | null
  email: string | null
  avatar_url?: string | null
  auth_user_id: string | null
  created_at: string | null
  updated_at: string | null
  isActive: boolean | null
  last_login: string | null
}

export const useUserProfile = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      console.log('🔍 Buscando perfil do usuário:', user.id)
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error)
        throw error
      }

      if (!userData) {
        throw new Error('Perfil do usuário não encontrado')
      }

      console.log('✅ Perfil carregado:', { 
        id: userData.id, 
        role: userData.role, 
        account_id: userData.account_id 
      })

      return {
        id: userData.id,
        account_id: userData.account_id,
        role: userData.role,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
        auth_user_id: userData.auth_user_id,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        isActive: userData.isactive,
        last_login: userData.last_login
      } as UserProfile
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      if (failureCount >= 3) return false
      if (error?.message?.includes('não encontrado')) return false
      return true
    },
  })
}

// Hook para verificar permissões específicas
export const usePermissions = () => {
  const { data: profile } = useUserProfile()

  const canViewAllAccounts = () => profile?.role === 'superadmin'
  
  const canManageAccount = (accountId?: number) => {
    if (!profile) return false
    if (profile.role === 'superadmin') return true
    if (profile.role === 'admin' && profile.account_id === accountId) return true
    return false
  }
  
  const canManageUsers = (targetAccountId?: number) => {
    if (!profile) return false
    if (profile.role === 'superadmin') return true
    if (profile.role === 'admin' && profile.account_id === targetAccountId) return true
    return false
  }
  
  const canViewConversations = (conversationAccountId?: number) => {
    if (!profile) return false
    if (profile.role === 'superadmin') return true
    if (profile.account_id === conversationAccountId) return true
    return false
  }
  
  const canManageConversations = (conversationAccountId?: number) => {
    if (!profile) return false
    if (profile.role === 'superadmin') return true
    if (['admin', 'agent'].includes(profile.role) && profile.account_id === conversationAccountId) return true
    return false
  }

  const isClient = () => profile?.role === 'cliente'
  const isAgent = () => profile?.role === 'agent'
  const isAdmin = () => profile?.role === 'admin'
  const isSuperAdmin = () => profile?.role === 'superadmin'

  return {
    profile,
    canViewAllAccounts,
    canManageAccount,
    canManageUsers,
    canViewConversations,
    canManageConversations,
    isClient,
    isAgent,
    isAdmin,
    isSuperAdmin,
  }
}
