
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { User as UserType } from "@/hooks/useSupabaseData"

interface UseConversationAssignmentProps {
  conversationId: number
  onAssignmentChange?: () => void
}

export const useConversationAssignment = ({
  conversationId,
  onAssignmentChange
}: UseConversationAssignmentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string>("none")
  const [isAssigning, setIsAssigning] = useState(false)
  const { toast } = useToast()

  const handleAssign = async () => {
    if (!selectedAgentId || 
        selectedAgentId.trim() === '' || 
        selectedAgentId === "" || 
        selectedAgentId === "none" ||
        selectedAgentId === "null" ||
        selectedAgentId === "undefined") {
      toast({
        title: "Erro",
        description: "Por favor, selecione um agente válido.",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)
    
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          assignee_id: selectedAgentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) throw error

      toast({
        title: "Conversa atribuída",
        description: "A conversa foi atribuída com sucesso ao agente.",
      })

      setIsOpen(false)
      setSelectedAgentId("none")
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error assigning conversation:', error)
      toast({
        title: "Erro ao atribuir conversa",
        description: "Não foi possível atribuir a conversa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async () => {
    setIsAssigning(true)
    
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          assignee_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) throw error

      toast({
        title: "Atribuição removida",
        description: "A conversa foi desatribuída com sucesso.",
      })

      setIsOpen(false)
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error unassigning conversation:', error)
      toast({
        title: "Erro ao desatribuir conversa",
        description: "Não foi possível desatribuir a conversa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const filterValidAgents = (agents: UserType[]) => {
    return agents?.filter(agent => {
      const isValidAgent = agent && 
                          typeof agent === 'object' &&
                          'id' in agent &&
                          'name' in agent &&
                          'email' in agent

      if (!isValidAgent) {
        console.warn('Invalid agent object:', agent)
        return false
      }

      const hasValidId = agent.id && 
                        typeof agent.id === 'string' && 
                        agent.id.trim().length > 0 &&
                        agent.id !== "" &&
                        agent.id !== "null" &&
                        agent.id !== "undefined" &&
                        agent.id.length >= 10

      const hasValidName = agent.name && 
                          typeof agent.name === 'string' && 
                          agent.name.trim().length > 0

      const hasValidEmail = agent.email && 
                           typeof agent.email === 'string' && 
                           agent.email.trim().length > 0 &&
                           agent.email.includes('@')

      const isValid = hasValidId && hasValidName && hasValidEmail
      
      if (!isValid) {
        console.warn('Invalid agent filtered out:', { 
          id: agent?.id, 
          name: agent?.name, 
          email: agent?.email,
          hasValidId,
          hasValidName,
          hasValidEmail
        })
      }
      
      return isValid
    }) || []
  }

  return {
    isOpen,
    setIsOpen,
    selectedAgentId,
    setSelectedAgentId,
    isAssigning,
    handleAssign,
    handleUnassign,
    filterValidAgents
  }
}
