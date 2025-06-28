
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  MessageSquare, 
  User, 
  Tag,
  Save,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
import { Conversation } from "@/types"
import { useUpdateConversationStatus, useAssignConversation } from "@/hooks/useMutations"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface DetailsPanelProps {
  conversation: Conversation
  agents: any[]
  onClose: () => void
  onRefreshConversations: () => void
}

export const DetailsPanel = ({
  conversation,
  agents,
  onClose,
  onRefreshConversations
}: DetailsPanelProps) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-80 border-l bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Detalhes</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Informações do Contato</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.contact?.avatar_url} />
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {conversation.contact?.name?.charAt(0)?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-gray-900">
                  {conversation.contact?.name || 'Contato Desconhecido'}
                </h4>
                <p className="text-sm text-gray-500">#{conversation.id}</p>
              </div>
            </div>

            {conversation.contact?.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{conversation.contact.phone}</span>
              </div>
            )}

            {conversation.contact?.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{conversation.contact.email}</span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Criado {format(new Date(conversation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Conversation Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Gerenciar Conversa</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberta</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="resolved">Resolvida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Responsável</label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
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

            {/* Current Status and Priority */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status atual:</span>
                <Badge className={cn("text-xs", getStatusColor(conversation.status))}>
                  {conversation.status === 'open' ? 'Aberta' : 
                   conversation.status === 'pending' ? 'Pendente' : 'Resolvida'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Prioridade:</span>
                <Badge className={cn("text-xs", getPriorityColor(conversation.priority || 'medium'))}>
                  {conversation.priority === 'high' ? 'Alta' : 
                   conversation.priority === 'low' ? 'Baixa' : 'Média'}
                </Badge>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveChanges}
              disabled={!hasChanges() || isSaving}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Resolver Conversa
            </Button>
            
            <Button variant="outline" size="sm" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Marcar como Urgente
            </Button>
            
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Tag className="h-4 w-4 mr-2" />
              Adicionar Etiqueta
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total de mensagens:</span>
              <span className="font-medium">{conversation.messages?.length || 0}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Última atividade:</span>
              <span className="font-medium">
                {format(new Date(conversation.updated_at), "HH:mm", { locale: ptBR })}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Canal:</span>
              <span className="font-medium">Chat Interno</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
