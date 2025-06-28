
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { User as UserType } from "@/hooks/useSupabaseData"

interface ConversationAssignmentProps {
  conversationId: number
  currentAssignee?: {
    id: string
    name: string
    avatar_url?: string
  }
  agents: UserType[]
  onAssignmentChange?: () => void
}

export const ConversationAssignment = ({
  conversationId,
  currentAssignee,
  agents,
  onAssignmentChange
}: ConversationAssignmentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string>("none") // ✅ Usar "none" ao invés de ""
  const [isAssigning, setIsAssigning] = useState(false)
  const { toast } = useToast()

  console.log('ConversationAssignment props:', { conversationId, currentAssignee, agents: agents?.length })
  console.log('Raw agents data:', agents)
  
  // ✅ Filtração MAIS rigorosa para agentes válidos
  const validAgents = agents?.filter(agent => {
    // Verificações mais rigorosas
    const isValidAgent = agent && 
                        typeof agent === 'object' &&
                        'id' in agent &&
                        'name' in agent &&
                        'email' in agent

    if (!isValidAgent) {
      console.warn('Invalid agent object:', agent)
      return false
    }

    // Verificar ID
    const hasValidId = agent.id && 
                      typeof agent.id === 'string' && 
                      agent.id.trim().length > 0 &&
                      agent.id !== "" &&
                      agent.id !== "null" &&
                      agent.id !== "undefined" &&
                      agent.id.length >= 10 // UUID mínimo

    // Verificar Nome
    const hasValidName = agent.name && 
                        typeof agent.name === 'string' && 
                        agent.name.trim().length > 0

    // Verificar Email
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
  
  console.log('Valid agents after filtering:', validAgents.length, validAgents)

  const handleAssign = async () => {
    // ✅ Verificação mais rigorosa
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
      setSelectedAgentId("none") // ✅ Reset para "none"
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

  // ✅ Função helper para renderizar SelectItems de forma segura
  const renderSelectItems = () => {
    return validAgents
      .filter(agent => {
        // ✅ Filtro final antes de renderizar
        const isValidForRender = agent && 
                               agent.id && 
                               typeof agent.id === 'string' &&
                               agent.id.trim() !== '' &&
                               agent.id !== "" &&
                               agent.id !== "null" &&
                               agent.id !== "undefined" &&
                               agent.name &&
                               agent.name.trim() !== ''

        if (!isValidForRender) {
          console.error('Agent filtered out at render time:', agent)
        }
        
        return isValidForRender
      })
      .map((agent) => {
        // ✅ Log detalhado para debug
        console.log('Rendering SelectItem:', { 
          id: agent.id, 
          name: agent.name,
          idType: typeof agent.id,
          idLength: agent.id?.length 
        })
        
        // ✅ Verificação final antes de renderizar
        if (!agent.id || agent.id.trim() === '' || agent.id === "") {
          console.error('CRITICAL: About to render SelectItem with empty value!', agent)
          return null // Não renderizar este item
        }
        
        return (
          <SelectItem key={`agent-${agent.id}`} value={agent.id}>
            {agent.name} ({agent.email || 'sem email'})
          </SelectItem>
        )
      })
      .filter(Boolean) // ✅ Remove itens null
  }

  // Verificar se há agentes válidos disponíveis
  if (!validAgents || validAgents.length === 0) {
    console.log('No valid agents available')
    return (
      <div className="flex items-center space-x-2">
        <User className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-400">Nenhum agente disponível</span>
      </div>
    )
  }

  if (currentAssignee) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-0 text-left justify-start hover:bg-transparent"
          >
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3" />
              <span className="text-xs text-gray-600">{currentAssignee.name}</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Atribuição</DialogTitle>
            <DialogDescription>
              Esta conversa está atribuída a {currentAssignee.name}. Você pode reatribuir ou remover a atribuição.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reatribuir para:</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar agente" />
                </SelectTrigger>
                <SelectContent>
                  {renderSelectItems()}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between space-x-2">
              <Button 
                variant="outline" 
                onClick={handleUnassign}
                disabled={isAssigning}
              >
                {isAssigning ? "Removendo..." : "Remover Atribuição"}
              </Button>
              <Button 
                onClick={handleAssign}
                disabled={!selectedAgentId || 
                         selectedAgentId === "none" || 
                         selectedAgentId.trim() === '' || 
                         selectedAgentId === "" || 
                         isAssigning}
              >
                {isAssigning ? "Atribuindo..." : "Reatribuir"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-0 text-left justify-start hover:bg-blue-50 text-blue-600"
        >
          <div className="flex items-center space-x-2">
            <UserPlus className="h-3 w-3" />
            <span className="text-xs">Atribuir agente</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Conversa</DialogTitle>
          <DialogDescription>
            Selecione um agente para atribuir esta conversa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar agente:</label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolher agente" />
              </SelectTrigger>
              <SelectContent>
                {renderSelectItems()}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedAgentId || 
                       selectedAgentId === "none" || 
                       selectedAgentId.trim() === '' || 
                       selectedAgentId === "" || 
                       isAssigning}
            >
              {isAssigning ? "Atribuindo..." : "Atribuir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
