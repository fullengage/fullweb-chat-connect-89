
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface AuthUser {
  id: string
  account_id: number
  role: 'superadmin' | 'admin' | 'agent' | 'cliente'
  name: string
  email: string
  avatar_url?: string
  auth_user_id: string
  created_at: string
  updated_at: string
  isActive: boolean
}

export const useAuthUser = () => {
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['auth-user', authUser?.id],
    queryFn: async () => {
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      console.log('🔍 Fetching user data for auth user:', authUser.id)
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (error) {
        console.error('❌ Error fetching user data:', error)
        throw error
      }

      if (!userData) {
        throw new Error('User data not found')
      }

      console.log('✅ User data loaded:', { 
        id: userData.id, 
        role: userData.role, 
        account_id: userData.account_id 
      })

      // Map database fields to interface - corrigindo isactive para isActive
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
        isActive: userData.isactive // Mapeando isactive (DB) para isActive (interface)
      } as AuthUser
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (failureCount >= 3) return false
      if (error?.message?.includes('User data not found')) return false
      return true
    },
  })
}

// Hook para verificar permissões específicas
export const usePermissions = () => {
  const { data: user } = useAuthUser()

  const canViewAllAccounts = () => user?.role === 'superadmin'
  
  const canManageAccount = (accountId?: number) => {
    if (!user) return false
    if (user.role === 'superadmin') return true
    if (user.role === 'admin' && user.account_id === accountId) return true
    return false
  }
  
  const canManageUsers = (targetAccountId?: number) => {
    if (!user) return false
    if (user.role === 'superadmin') return true
    if (user.role === 'admin' && user.account_id === targetAccountId) return true
    return false
  }
  
  const canViewConversations = (conversationAccountId?: number) => {
    if (!user) return false
    if (user.role === 'superadmin') return true
    if (user.account_id === conversationAccountId) return true
    return false
  }
  
  const canManageConversations = (conversationAccountId?: number) => {
    if (!user) return false
    if (user.role === 'superadmin') return true
    if (['admin', 'agent'].includes(user.role) && user.account_id === conversationAccountId) return true
    return false
  }

  const isClient = () => user?.role === 'cliente'
  const isAgent = () => user?.role === 'agent'
  const isAdmin = () => user?.role === 'admin'
  const isSuperAdmin = () => user?.role === 'superadmin'

  return {
    user,
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
