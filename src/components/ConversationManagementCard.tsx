
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserCheck, Save } from "lucide-react"
import { Conversation } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useUpdateConversationStatus, useAssignConversation } from "@/hooks/useMutations"

interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
}

interface ConversationManagementCardProps {
  conversation: Conversation
  agents: Agent[]
}

export const ConversationManagementCard = ({ conversation, agents }: ConversationManagementCardProps) => {
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedAssignee, setSelectedAssignee] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const updateStatus = useUpdateConversationStatus()
  const assignConversation = useAssignConversation()

  // Filter valid agents to prevent empty values in SelectItem
  const validAgents = agents?.filter(agent => 
    agent && 
    agent.id && 
    typeof agent.id === 'number' && 
    agent.name && 
    typeof agent.name === 'string' && 
    agent.name.trim() !== ''
  ) || []

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
  }

  const handleAssigneeChange = (assigneeId: string) => {
    setSelectedAssignee(assigneeId)
  }

  const handleSaveChanges = async () => {
    if (!conversation) return

    setIsSaving(true)
    
    try {
      const promises = []

      // Atualizar status se foi alterado
      if (selectedStatus && selectedStatus !== conversation.status) {
        promises.push(
          updateStatus.mutateAsync({ 
            conversationId: conversation.id, 
            status: selectedStatus 
          })
        )
      }

      // Atualizar responsável se foi alterado
      const currentAssigneeId = conversation.assignee?.id?.toString() || ""
      if (selectedAssignee !== currentAssigneeId) {
        // Convert assigneeId to string if not empty, otherwise null
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
          description: "As alterações da conversa foram salvas com sucesso.",
        })

        // Reset the selected values after saving
        setSelectedStatus("")
        setSelectedAssignee("")
      } else {
        toast({
          title: "Nenhuma alteração",
          description: "Não há alterações para salvar.",
          variant: "default",
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
    if (!conversation) return false
    
    const statusChanged = selectedStatus && selectedStatus !== conversation.status
    const assigneeChanged = selectedAssignee !== (conversation.assignee?.id?.toString() || "")
    
    return statusChanged || assigneeChanged
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Gerenciar Conversa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={selectedStatus || conversation.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="mt-1">
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
          <label className="text-sm font-medium">Responsável</label>
          <Select value={selectedAssignee || conversation.assignee?.id?.toString() || ""} onValueChange={handleAssigneeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecionar responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Não atribuído</SelectItem>
              {validAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id.toString()}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {conversation.assignee && (
          <div className="flex items-center space-x-2 text-sm">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span>Atribuído a {conversation.assignee.name}</span>
          </div>
        )}

        {/* Botão Salvar */}
        <div className="pt-2">
          <Button 
            onClick={handleSaveChanges}
            disabled={!hasChanges() || isSaving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
