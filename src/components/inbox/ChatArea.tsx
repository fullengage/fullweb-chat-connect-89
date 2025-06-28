
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Info,
  Lock,
  AlertTriangle
} from "lucide-react"
import { Conversation } from "@/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ConversationAssignment } from "@/components/ConversationAssignment"

interface ChatAreaProps {
  conversation: Conversation | null
  currentUser: any
  agents: any[]
  onToggleDetails: () => void
  showDetailsPanel: boolean
  onRefreshConversations: () => void
}

export const ChatArea = ({
  conversation,
  currentUser,
  agents,
  onToggleDetails,
  showDetailsPanel,
  onRefreshConversations
}: ChatAreaProps) => {
  const [message, setMessage] = useState("")

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-500">
            Escolha uma conversa da lista para começar a conversar
          </p>
        </div>
      </div>
    )
  }

  // ✅ Verificar se conversa tem agente atribuído
  const hasAssignedAgent = conversation.assignee && conversation.assignee.id

  // ✅ Se não tem agente atribuído, mostrar tela de bloqueio
  if (!hasAssignedAgent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-red-900 mb-2">
            Conversa Bloqueada
          </h3>
          <p className="text-red-700 mb-6">
            Esta conversa precisa ter um agente atribuído antes de poder ser aberta. 
            Atribua um agente responsável para continuar.
          </p>
          
          <div className="bg-white p-4 rounded-lg border border-red-200 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Atribuir Agente:</h4>
            <ConversationAssignment
              conversationId={conversation.id}
              currentAssignee={conversation.assignee}
              agents={agents}
              onAssignmentChange={onRefreshConversations}
            />
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Atribuição obrigatória para prosseguir</span>
          </div>
        </div>
      </div>
    )
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta'
      case 'pending':
        return 'Pendente'
      case 'resolved':
        return 'Resolvida'
      default:
        return status
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Simplified Header */}
      <div className="p-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={conversation.contact?.avatar_url} />
              <AvatarFallback>
                {conversation.contact?.name?.charAt(0)?.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="font-medium text-gray-900 text-sm">
                {conversation.contact?.name || 'Contato Desconhecido'}
              </h2>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                  {getStatusText(conversation.status)}
                </Badge>
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggleDetails}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area - Now More Prominent */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {/* Mensagem de sistema indicando que a conversa foi desbloqueada */}
        <div className="flex justify-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-md">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-800">
                Conversa ativa - Agente {conversation.assignee?.name} responsável
              </span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              {format(new Date(conversation.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>
        </div>

        {/* Área para mensagens futuras */}
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">💬 Pronto para conversar!</p>
          <p className="text-sm mt-2">Digite sua mensagem abaixo</p>
        </div>
      </div>

      {/* Message Input - More Prominent */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // TODO: Implementar envio de mensagem
                console.log('Enviar mensagem:', message)
                setMessage("")
              }
            }}
            className="flex-1"
          />
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
