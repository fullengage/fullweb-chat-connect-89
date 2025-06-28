
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

// ✅ Função para validar um usuário individualmente
const validateUser = (user: any): user is User => {
  if (!user || typeof user !== 'object') return false
  
  // Validação do ID
  if (!user.id || typeof user.id !== 'string' || user.id.trim() === '') return false
  if (user.id === 'null' || user.id === 'undefined') return false
  if (user.id.length < 10) return false // UUIDs têm pelo menos 36 caracteres, mas vamos ser mais flexíveis
  
  // Validação do nome
  if (!user.name || typeof user.name !== 'string' || user.name.trim() === '') return false
  
  // Validação do email
  if (!user.email || typeof user.email !== 'string' || user.email.trim() === '') return false
  if (!user.email.includes('@')) return false
  
  // Validação do account_id
  if (typeof user.account_id !== 'number' || user.account_id <= 0) return false
  
  return true
}

// ✅ Função para sanitizar filtros
const sanitizeFilters = (account_id: number | null | undefined) => {
  if (!account_id || typeof account_id !== 'number' || account_id <= 0) {
    return null
  }
  return account_id
}

export const useUsers = (account_id: number) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['users', account_id, authUser?.id],
    queryFn: async () => {
      console.log('🔍 Fetching users for account:', account_id)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // ✅ Validar account_id antes de fazer a query
      const sanitizedAccountId = sanitizeFilters(account_id)
      if (!sanitizedAccountId) {
        console.warn('❌ Invalid account_id provided:', account_id)
        return []
      }

      try {
        // ✅ Usar função segura do banco de dados com retry logic
        let { data, error } = await supabase.rpc('get_valid_users')

        if (error) {
          console.error('❌ Database error:', error)
          
          // ✅ Retry logic para erros temporários
          if (error.message.includes('timeout') || error.message.includes('connection')) {
            console.log('🔄 Retrying query due to connection error...')
            // Fazer uma segunda tentativa
            const retryResult = await supabase.rpc('get_valid_users')
            if (retryResult.error) throw retryResult.error
            data = retryResult.data
          } else {
            throw error
          }
        }

        // Buscar dados do usuário atual para aplicar filtros baseados no papel
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single()

        if (currentUserError || !currentUserData) {
          console.error('❌ Current user data error:', currentUserError)
          throw new Error('Current user data not found')
        }

        // ✅ Validar dados antes de processar
        if (!Array.isArray(data)) {
          console.warn('❌ Invalid data format received from database')
          return []
        }

        // ✅ Filtrar e validar usuários
        let validUsers = data.filter(validateUser)
        
        console.log(`✅ Filtered ${data.length} raw users to ${validUsers.length} valid users`)
        
        // Aplicar filtros baseados no papel do usuário
        if (currentUserData.role === 'superadmin') {
          // Superadmin pode ver usuários de qualquer conta se especificada
          if (sanitizedAccountId) {
            validUsers = validUsers.filter(user => user.account_id === sanitizedAccountId)
          }
        } else {
          // Admin e Agent só podem ver usuários da sua própria conta
          validUsers = validUsers.filter(user => user.account_id === currentUserData.account_id)
        }

        console.log(`✅ Applied role filters, final count: ${validUsers.length}`)
        
        // ✅ Log final para debug
        validUsers.forEach(user => {
          console.log('✅ Valid user:', { 
            id: user.id, 
            name: user.name, 
            email: user.email?.substring(0, 10) + '...',
            account_id: user.account_id
          })
        })

        return validUsers as User[]
        
      } catch (error: any) {
        console.error('❌ Error in useUsers:', error)
        
        // ✅ Toast específico baseado no tipo de erro
        let errorMessage = 'Erro ao buscar usuários'
        if (error.message.includes('connection')) {
          errorMessage = 'Erro de conexão. Verifique sua internet.'
        } else if (error.message.includes('permission')) {
          errorMessage = 'Sem permissão para acessar usuários.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Tempo limite excedido. Tente novamente.'
        }
        
        toast({
          title: "Erro ao buscar usuários",
          description: errorMessage,
          variant: "destructive",
        })
        
        throw error
      }
    },
    enabled: !!authUser && !!sanitizeFilters(account_id),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // ✅ Retry logic customizado
      if (failureCount >= 3) return false
      if (error?.message?.includes('permission')) return false
      return true
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
