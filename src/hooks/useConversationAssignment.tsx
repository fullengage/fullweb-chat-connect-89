
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { User as UserType } from "@/hooks/useSupabaseData"

interface UseConversationAssignmentProps {
  conversationId: number
  onAssignmentChange?: () => void
}

// ✅ Função para validar agent ID
const isValidAgentId = (agentId: string | null | undefined): boolean => {
  if (!agentId || typeof agentId !== 'string') return false
  if (agentId.trim() === '' || agentId === "" || agentId === "none") return false
  if (agentId === "null" || agentId === "undefined") return false
  if (agentId.length < 10) return false // UUIDs são mais longos
  return true
}

// ✅ Função para sanitizar agent ID
const sanitizeAgentId = (agentId: string | null | undefined): string => {
  if (isValidAgentId(agentId)) {
    return agentId!
  }
  return "none"
}

export const useConversationAssignment = ({
  conversationId,
  onAssignmentChange
}: UseConversationAssignmentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string>("none")
  const [isAssigning, setIsAssigning] = useState(false)
  const { toast } = useToast()

  // ✅ Handler com validação para mudança de agente selecionado
  const handleSelectedAgentIdChange = (value: string) => {
    console.log('🔄 Changing selected agent ID:', { from: selectedAgentId, to: value })
    
    // ✅ Sanitizar o valor recebido
    const sanitizedValue = sanitizeAgentId(value)
    
    if (sanitizedValue !== value) {
      console.warn('⚠️ Agent ID was sanitized:', { original: value, sanitized: sanitizedValue })
    }
    
    setSelectedAgentId(sanitizedValue)
  }

  const handleAssign = async () => {
    console.log('🎯 Starting assignment process:', { 
      conversationId, 
      selectedAgentId,
      isValid: isValidAgentId(selectedAgentId)
    })

    // ✅ Validação rigorosa antes da atribuição
    if (!isValidAgentId(selectedAgentId)) {
      console.error('❌ Invalid agent ID for assignment:', selectedAgentId)
      toast({
        title: "Erro de validação",
        description: "Por favor, selecione um agente válido para a atribuição.",
        variant: "destructive",
      })
      return
    }

    // ✅ Validação do conversation ID
    if (!conversationId || typeof conversationId !== 'number' || conversationId <= 0) {
      console.error('❌ Invalid conversation ID:', conversationId)
      toast({
        title: "Erro",
        description: "ID da conversa inválido.",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)
    
    try {
      console.log('📤 Executing assignment update...')
      
      const { error } = await supabase
        .from('conversations')
        .update({ 
          assignee_id: selectedAgentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) {
        console.error('❌ Assignment error:', error)
        throw error
      }

      console.log('✅ Assignment successful')
      
      toast({
        title: "Conversa atribuída",
        description: "A conversa foi atribuída com sucesso ao agente.",
      })

      setIsOpen(false)
      setSelectedAgentId("none")
      onAssignmentChange?.()
      
    } catch (error: any) {
      console.error('❌ Error assigning conversation:', error)
      
      // ✅ Mensagem de erro específica
      let errorMessage = "Não foi possível atribuir a conversa. Tente novamente."
      if (error.message.includes('foreign key')) {
        errorMessage = "Agente selecionado não é válido."
      } else if (error.message.includes('permission')) {
        errorMessage = "Sem permissão para atribuir conversas."
      }
      
      toast({
        title: "Erro ao atribuir conversa",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async () => {
    console.log('🔄 Starting unassignment process:', { conversationId })
    
    // ✅ Validação do conversation ID
    if (!conversationId || typeof conversationId !== 'number' || conversationId <= 0) {
      console.error('❌ Invalid conversation ID for unassignment:', conversationId)
      toast({
        title: "Erro",
        description: "ID da conversa inválido.",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)
    
    try {
      console.log('📤 Executing unassignment update...')
      
      const { error } = await supabase
        .from('conversations')
        .update({ 
          assignee_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) {
        console.error('❌ Unassignment error:', error)
        throw error
      }

      console.log('✅ Unassignment successful')

      toast({
        title: "Atribuição removida",
        description: "A conversa foi desatribuída com sucesso.",
      })

      setIsOpen(false)
      onAssignmentChange?.()
      
    } catch (error: any) {
      console.error('❌ Error unassigning conversation:', error)
      
      toast({
        title: "Erro ao desatribuir conversa",
        description: "Não foi possível desatribuir a conversa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  // ✅ Função robusta para filtrar agentes válidos
  const filterValidAgents = (agents: UserType[]): UserType[] => {
    if (!Array.isArray(agents)) {
      console.warn('⚠️ Agents is not an array:', agents)
      return []
    }

    const validAgents = agents.filter(agent => {
      // ✅ Verificação básica de objeto
      if (!agent || typeof agent !== 'object') {
        console.warn('⚠️ Invalid agent object (not object):', agent)
        return false
      }

      // ✅ Verificação de propriedades obrigatórias
      const hasRequiredProps = 'id' in agent && 'name' in agent && 'email' in agent

      if (!hasRequiredProps) {
        console.warn('⚠️ Agent missing required properties:', agent)
        return false
      }

      // ✅ Validação do ID
      const hasValidId = isValidAgentId(agent.id)

      // ✅ Validação do nome
      const hasValidName = agent.name && 
                          typeof agent.name === 'string' && 
                          agent.name.trim().length > 0

      // ✅ Validação do email
      const hasValidEmail = agent.email && 
                           typeof agent.email === 'string' && 
                           agent.email.trim().length > 0 &&
                           agent.email.includes('@')

      const isValid = hasValidId && hasValidName && hasValidEmail
      
      if (!isValid) {
        console.warn('⚠️ Agent failed validation:', { 
          id: agent?.id, 
          name: agent?.name, 
          email: agent?.email,
          hasValidId,
          hasValidName,
          hasValidEmail
        })
      } else {
        console.log('✅ Valid agent:', { 
          id: agent.id, 
          name: agent.name, 
          email: agent.email?.substring(0, 10) + '...'
        })
      }
      
      return isValid
    })

    console.log(`✅ Filtered ${agents.length} agents to ${validAgents.length} valid agents`)
    return validAgents
  }

  return {
    isOpen,
    setIsOpen,
    selectedAgentId,
    setSelectedAgentId: handleSelectedAgentIdChange,
    isAssigning,
    handleAssign,
    handleUnassign,
    filterValidAgents
  }
}
