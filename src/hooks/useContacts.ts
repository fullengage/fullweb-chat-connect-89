
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface Contact {
  id: number
  account_id: number
  name?: string
  email?: string
  phone?: string
  avatar_url?: string
  last_seen?: string
  custom_fields?: any
  created_at: string
  updated_at: string
}

export const useContacts = (account_id: number) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['contacts', account_id, authUser?.id],
    queryFn: async () => {
      console.log('Fetching contacts for account:', account_id)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Buscar dados do usuário atual
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (currentUserError || !currentUserData) {
        console.error('Current user data error:', currentUserError)
        throw new Error('Current user data not found')
      }

      let query = supabase
        .from('contacts')
        .select('*')
        .order('name')

      // Aplicar filtros baseados no papel do usuário
      if (currentUserData.role === 'superadmin') {
        // Superadmin pode ver contatos de qualquer conta se especificada
        if (account_id) {
          query = query.eq('account_id', account_id)
        }
      } else {
        // Admin e Agent só podem ver contatos da sua própria conta
        query = query.eq('account_id', currentUserData.account_id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar contatos",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      console.log('Contacts fetched successfully:', data?.length)
      return data as Contact[]
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
  })
}

export type { Contact }
