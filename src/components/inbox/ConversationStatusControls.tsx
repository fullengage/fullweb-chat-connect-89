
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { Conversation } from "@/types"
import { useUpdateConversationStatus, useAssignConversation } from "@/hooks/useMutations"
import { useToast } from "@/hooks/use-toast"

interface ConversationStatusControlsProps {
  conversation: Conversation
  agents: any[]
  onRefreshConversations: () => void
}

export const ConversationStatusControls = ({
  conversation,
  agents,
  onRefreshConversations
}: ConversationStatusControlsProps) => {
  const [selectedStatus, setSelectedStatus] = useState(conversation.status)
  const [selectedAssignee, setSelectedAssignee] = useState(conversation.assignee?.id || "")
  const [isSaving, setIsSaving] = useState(false)
  
  const updateStatus = useUpdateConversationStatus()
  const assignConversation = useAssignConversation()
  const { toast } = useToast()

  const validAgents = agents?.filter(agent => 
    agent && 
    agent.id && 
    typeof agent.id === 'string' && 
    agent.name && 
    typeof agent.name === 'string' && 
    agent.name.trim() !== ''
  ) || []

  const handleSaveChanges = async () => {
    setIsSaving(true)
    
    try {
      const promises = []

      // Update status if changed
      if (selectedStatus !== conversation.status) {
        promises.push(
          updateStatus.mutateAsync({ 
            conversationId: conversation.id, 
            status: selectedStatus 
          })
        )
      }

      // Update assignee if changed
      const currentAssigneeId = conversation.assignee?.id || ""
      if (selectedAssignee !== currentAssigneeId) {
        const assigneeId = selectedAssignee && selectedAssignee !== "" ? selectedAssignee : null
        promises.push(
          assignConversation.mutateAsync({ 
            conversationId: conversation.id, 
            assigneeId 
          })
        )
      }

      if (promises.length > 0) {
        await Promise.all(promises)
        
        toast({
          title: "Alterações salvas",
          description: "As alterações foram salvas com sucesso.",
        })

        onRefreshConversations()
      } else {
        toast({
          title: "Nenhuma alteração",
          description: "Não há alterações para salvar.",
        })
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = () => {
    const statusChanged = selectedStatus !== conversation.status
    const assigneeChanged = selectedAssignee !== (conversation.assignee?.id || "")
    return statusChanged || assigneeChanged
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Aberta</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="resolved">Resolvida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Responsável</label>
        <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Selecionar responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Não atribuído</SelectItem>
            {validAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleSaveChanges}
        disabled={!hasChanges() || isSaving}
        className="w-full bg-purple-600 hover:bg-purple-700"
        size="sm"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </div>
  )
}
