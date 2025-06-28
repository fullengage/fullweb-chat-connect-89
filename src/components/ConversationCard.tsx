
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MessageCircle, User, Lock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Conversation } from "@/types"
import { ConversationAssignment } from "./ConversationAssignment"
import { useUsers } from "@/hooks/useSupabaseData"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ConversationCardProps {
  conversation: Conversation
  onClick?: () => void
}

export const ConversationCard = ({ conversation, onClick }: ConversationCardProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { user: authUser } = useAuth()
  const { toast } = useToast()

  // Buscar dados do usuário atual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser) return

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        return
      }

      setCurrentUser(userData)
    }

    fetchCurrentUser()
  }, [authUser])

  const {
    data: agents = [],
    refetch: refetchAgents
  } = useUsers(currentUser?.account_id || 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const handleAssignmentChange = () => {
    // Refresh agents data and trigger parent refresh if needed
    refetchAgents()
  }

  // ✅ Verificar se conversa tem agente atribuído
  const hasAssignedAgent = conversation.assignee && conversation.assignee.id

  // ✅ Handler para click - bloquear se não tiver agente
  const handleCardClick = () => {
    if (!hasAssignedAgent) {
      toast({
        title: "Conversa bloqueada",
        description: "Você deve atribuir um agente à conversa antes de abri-la.",
        variant: "destructive",
      })
      return
    }
    
    if (onClick) {
      onClick()
    }
  }

  return (
    <div 
      className={`p-4 border rounded-lg transition-all duration-200 ${
        hasAssignedAgent 
          ? 'hover:shadow-md cursor-pointer bg-white' 
          : 'bg-gray-50 border-gray-300 cursor-not-allowed opacity-75'
      }`}
      onClick={handleCardClick}
    >
      {/* ✅ Indicador de bloqueio */}
      {!hasAssignedAgent && (
        <div className="flex items-center space-x-2 mb-2 text-red-600">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">Atribuição obrigatória</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.contact?.avatar_url} />
            <AvatarFallback>
              {conversation.contact?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              {conversation.contact?.name || 'Contato Desconhecido'}
            </h3>
            <p className="text-sm text-gray-500">
              {conversation.contact?.email || conversation.contact?.phone || 'Sem contato'}
            </p>
          </div>
        </div>

        <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
          {getStatusText(conversation.status)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{conversation.inbox?.name || 'Chat Interno'}</span>
          </div>
          
          {conversation.unread_count && conversation.unread_count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {conversation.unread_count} não lidas
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(conversation.updated_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
        </div>

        {/* Assignment Section */}
        <div className="pt-2 border-t">
          <ConversationAssignment
            conversationId={conversation.id}
            currentAssignee={conversation.assignee}
            agents={agents}
            onAssignmentChange={handleAssignmentChange}
          />
        </div>
      </div>
    </div>
  )
}
