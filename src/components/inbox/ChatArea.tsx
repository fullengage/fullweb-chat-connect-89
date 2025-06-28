
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Info, 
  UserPlus,
  MessageSquare,
  Clock,
  CheckCircle2,
  User
} from "lucide-react"
import { Conversation, Message } from "@/types"
import { useSendMessage } from "@/hooks/useSupabaseData"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sendMessageMutation = useSendMessage()
  const { toast } = useToast()

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (conversation?.messages) {
      scrollToBottom()
    }
  }, [conversation?.messages])

  // Handle message sending
  const handleSendMessage = async () => {
    if (!message.trim() || !conversation || !currentUser) return

    const messageContent = message.trim()
    setMessage("")
    setIsTyping(false)

    try {
      await sendMessageMutation.mutateAsync({
        conversation_id: conversation.id,
        sender_type: 'agent',
        sender_id: currentUser.id,
        content: messageContent
      })

      onRefreshConversations()
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aberta'
      case 'pending': return 'Pendente'
      case 'resolved': return 'Resolvida'
      default: return status
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="h-12 w-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-500">
            Escolha uma conversa na barra lateral para começar a atender.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.contact?.avatar_url} />
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {conversation.contact?.name?.charAt(0)?.toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {conversation.contact?.name || 'Contato Desconhecido'}
              </h2>
              <MessageSquare className="h-4 w-4 text-green-500" />
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                {getStatusIcon(conversation.status)}
                <span>{getStatusText(conversation.status)}</span>
              </div>
              
              {conversation.assignee && (
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{conversation.assignee.name}</span>
                </div>
              )}
              
              <span>#{conversation.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDetails}
            className={cn(
              "text-gray-500 hover:text-gray-700",
              showDetailsPanel && "bg-gray-100 text-gray-900"
            )}
          >
            <Info className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {conversation.messages && conversation.messages.length > 0 ? (
          conversation.messages.map((msg: Message, index: number) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.sender_type === 'agent' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm",
                  msg.sender_type === 'agent'
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-900 border"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <div className={cn(
                  "flex items-center justify-between mt-1 text-xs",
                  msg.sender_type === 'agent' ? "text-purple-100" : "text-gray-500"
                )}>
                  <span>
                    {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                  </span>
                  {msg.sender_type === 'agent' && (
                    <CheckCircle2 className="h-3 w-3 ml-2" />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma mensagem ainda</p>
            <p className="text-sm">Envie a primeira mensagem para iniciar a conversa</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-t">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Digitando...</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="Digite sua mensagem... (Ctrl+Enter para enviar)"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setIsTyping(e.target.value.length > 0)
              }}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] max-h-32 resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              disabled={sendMessageMutation.isPending}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {sendMessageMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Ctrl+Enter para enviar</span>
          {conversation.assignee && (
            <span>Atribuído a {conversation.assignee.name}</span>
          )}
        </div>
      </div>
    </div>
  )
}
