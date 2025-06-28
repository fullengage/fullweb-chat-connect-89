
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User as UserType } from "@/hooks/useSupabaseData"

interface AssignmentDialogContentProps {
  currentAssignee?: {
    id: string
    name: string
    avatar_url?: string
  }
  selectedAgentId: string
  onSelectedAgentIdChange: (value: string) => void
  validAgents: UserType[]
  isAssigning: boolean
  onAssign: () => void
  onUnassign: () => void
  onClose: () => void
}

export const AssignmentDialogContent = ({
  currentAssignee,
  selectedAgentId,
  onSelectedAgentIdChange,
  validAgents,
  isAssigning,
  onAssign,
  onUnassign,
  onClose
}: AssignmentDialogContentProps) => {
  
  // ✅ Função super rigorosa para renderizar SelectItems
  const renderSelectItems = () => {
    console.log('🎯 Rendering SelectItems for agents:', validAgents?.length || 0)
    
    if (!Array.isArray(validAgents) || validAgents.length === 0) {
      console.warn('⚠️ No valid agents available for SelectItems')
      return (
        <SelectItem value="no-agents" disabled>
          Nenhum agente disponível
        </SelectItem>
      )
    }

    const filteredAgents = validAgents.filter(agent => {
      // ✅ Validação extremamente rigorosa
      if (!agent || typeof agent !== 'object') {
        console.warn('⚠️ Agent is not an object:', agent)
        return false
      }

      if (!agent.id || typeof agent.id !== 'string') {
        console.warn('⚠️ Agent ID is not a valid string:', agent.id)
        return false
      }

      const trimmedId = agent.id.trim()
      if (trimmedId === '' || trimmedId === 'null' || trimmedId === 'undefined') {
        console.warn('⚠️ Agent ID is empty or invalid after trim:', trimmedId)
        return false
      }

      if (trimmedId.length < 10) {
        console.warn('⚠️ Agent ID is too short (should be UUID):', trimmedId)
        return false
      }

      if (!agent.name || typeof agent.name !== 'string' || agent.name.trim() === '') {
        console.warn('⚠️ Agent name is invalid:', agent.name)
        return false
      }

      return true
    })

    console.log(`✅ Filtered ${validAgents.length} agents to ${filteredAgents.length} valid agents`)

    if (filteredAgents.length === 0) {
      return (
        <SelectItem value="no-valid-agents" disabled>
          Nenhum agente válido disponível
        </SelectItem>
      )
    }

    return filteredAgents.map((agent) => {
      const agentId = agent.id.trim()
      const agentName = agent.name.trim()
      const agentEmail = agent.email?.trim() || 'sem email'
      
      console.log('✅ Rendering SelectItem:', { 
        id: agentId, 
        name: agentName,
        email: agentEmail.substring(0, 15) + '...'
      })
      
      return (
        <SelectItem key={`agent-${agentId}`} value={agentId}>
          <div className="flex flex-col">
            <span className="font-medium">{agentName}</span>
            <span className="text-sm text-gray-500">{agentEmail}</span>
          </div>
        </SelectItem>
      )
    })
  }

  // ✅ Validação se pode atribuir
  const canAssign = () => {
    if (!selectedAgentId || isAssigning) return false
    if (selectedAgentId === "none" || selectedAgentId === "no-agents" || selectedAgentId === "no-valid-agents") return false
    if (selectedAgentId.trim() === '' || selectedAgentId.trim().length < 10) return false
    return true
  }

  if (currentAssignee) {
    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Atribuição</DialogTitle>
          <DialogDescription>
            Esta conversa está atribuída a <strong>{currentAssignee.name}</strong>. 
            Você pode reatribuir ou remover a atribuição.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Reatribuir para:
            </label>
            <Select value={selectedAgentId} onValueChange={onSelectedAgentIdChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar agente" />
              </SelectTrigger>
              <SelectContent>
                {renderSelectItems()}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={onUnassign}
              disabled={isAssigning}
              className="flex-1"
            >
              {isAssigning ? "Removendo..." : "Remover Atribuição"}
            </Button>
            <Button 
              onClick={onAssign}
              disabled={!canAssign()}
              className="flex-1"
            >
              {isAssigning ? "Atribuindo..." : "Reatribuir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Atribuir Conversa</DialogTitle>
        <DialogDescription>
          Selecione um agente para atribuir esta conversa.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Selecionar agente:
          </label>
          <Select value={selectedAgentId} onValueChange={onSelectedAgentIdChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolher agente" />
            </SelectTrigger>
            <SelectContent>
              {renderSelectItems()}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onAssign}
            disabled={!canAssign()}
            className="flex-1"
          >
            {isAssigning ? "Atribuindo..." : "Atribuir"}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
