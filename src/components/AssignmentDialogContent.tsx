
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
  
  // ✅ Função robusta para renderizar SelectItems
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

    return validAgents
      .filter(agent => {
        // ✅ Validação rigorosa antes de renderizar
        const isValidForRender = agent && 
                               agent.id && 
                               typeof agent.id === 'string' &&
                               agent.id.trim() !== '' &&
                               agent.id !== "null" &&
                               agent.id !== "undefined" &&
                               agent.id.length >= 10 && // UUIDs são longos
                               agent.name &&
                               typeof agent.name === 'string' &&
                               agent.name.trim() !== ''

        if (!isValidForRender) {
          console.warn('⚠️ Agent filtered out at render time:', {
            id: agent?.id,
            name: agent?.name,
            hasId: !!agent?.id,
            idType: typeof agent?.id,
            idLength: agent?.id?.length,
            hasName: !!agent?.name,
            nameType: typeof agent?.name
          })
        }
        
        return isValidForRender
      })
      .map((agent) => {
        console.log('✅ Rendering SelectItem for agent:', { 
          id: agent.id, 
          name: agent.name,
          email: agent.email?.substring(0, 10) + '...'
        })
        
        // ✅ Validação final antes de criar o SelectItem
        if (!agent.id || agent.id.trim() === '') {
          console.error('❌ CRITICAL: About to render SelectItem with empty value!', agent)
          return null
        }
        
        return (
          <SelectItem key={`agent-${agent.id}`} value={agent.id}>
            {agent.name} ({agent.email || 'sem email'})
          </SelectItem>
        )
      })
      .filter(Boolean) // Remove nulls
  }

  // ✅ Validação se pode atribuir
  const canAssign = () => {
    return selectedAgentId && 
           selectedAgentId !== "none" && 
           selectedAgentId !== "no-agents" &&
           selectedAgentId.trim() !== '' && 
           selectedAgentId !== "" && 
           !isAssigning
  }

  if (currentAssignee) {
    return (
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
            <Select value={selectedAgentId} onValueChange={onSelectedAgentIdChange}>
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
              onClick={onUnassign}
              disabled={isAssigning}
            >
              {isAssigning ? "Removendo..." : "Remover Atribuição"}
            </Button>
            <Button 
              onClick={onAssign}
              disabled={!canAssign()}
            >
              {isAssigning ? "Atribuindo..." : "Reatribuir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  return (
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
          <Select value={selectedAgentId} onValueChange={onSelectedAgentIdChange}>
            <SelectTrigger>
              <SelectValue placeholder="Escolher agente" />
            </SelectTrigger>
            <SelectContent>
              {renderSelectItems()}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={onAssign}
            disabled={!canAssign()}
          >
            {isAssigning ? "Atribuindo..." : "Atribuir"}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
