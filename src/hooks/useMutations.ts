
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

// Hook para atualizar status da conversa
export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: number, status: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Status atualizado",
        description: "Status da conversa foi atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error updating conversation status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para atualizar estágio do kanban da conversa
export const useUpdateConversationKanbanStage = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, kanbanStage }: { conversationId: number, kanbanStage: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ 
          kanban_stage: kanbanStage, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Estágio atualizado",
        description: "Conversa movida para novo estágio",
      })
    },
    onError: (error: any) => {
      console.error('Error updating conversation kanban stage:', error)
      toast({
        title: "Erro ao atualizar estágio",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para criar uma nova conversa
export const useCreateConversation = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (conversationData: {
      account_id: number
      contact_id: number
      status?: string
      kanban_stage?: string
    }) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Conversa criada",
        description: "Nova conversa criada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error creating conversation:', error)
      toast({
        title: "Erro ao criar conversa",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para enviar mensagem
export const useSendMessage = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (messageData: {
      conversation_id: number
      sender_type: 'contact' | 'agent' | 'system'
      sender_id?: string
      content: string
      attachments?: any
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error sending message:', error)
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para atribuir conversa a um agente
export const useAssignConversation = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, assigneeId }: { conversationId: number, assigneeId: string | null }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ 
          assignee_id: assigneeId,
          updated_at: new Date().toISOString() 
        })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Atribuição atualizada",
        description: "A atribuição da conversa foi atualizada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error updating conversation assignment:', error)
      toast({
        title: "Erro ao atualizar atribuição",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}
