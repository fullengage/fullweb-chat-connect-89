
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export interface User {
  id: string
  account_id: number
  role: 'superadmin' | 'admin' | 'agent'
  name: string
  email: string
  avatar_url?: string
  auth_user_id?: string
  created_at: string
  updated_at: string
}

export const useUsers = (account_id: number) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['users', account_id, authUser?.id],
    queryFn: async () => {
      console.log('Fetching users for account:', account_id)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // ✅ Usar função segura do banco de dados
      const { data, error } = await supabase.rpc('get_valid_users')

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      // Buscar dados do usuário atual para aplicar filtros baseados no papel
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (currentUserError || !currentUserData) {
        console.error('Current user data error:', currentUserError)
        throw new Error('Current user data not found')
      }

      // Aplicar filtros baseados no papel do usuário
      let filteredUsers = data || []
      
      if (currentUserData.role === 'superadmin') {
        // Superadmin pode ver usuários de qualquer conta se especificada
        if (account_id) {
          filteredUsers = filteredUsers.filter(user => user.account_id === account_id)
        }
      } else {
        // Admin e Agent só podem ver usuários da sua própria conta
        filteredUsers = filteredUsers.filter(user => user.account_id === currentUserData.account_id)
      }

      console.log('Valid users fetched successfully:', filteredUsers.length)
      return filteredUsers as User[]
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
  })
}
