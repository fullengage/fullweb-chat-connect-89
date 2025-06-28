
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Conversation } from "@/types"

interface ConversationMessagesProps {
  conversation: Conversation
}

export const ConversationMessages = ({ conversation }: ConversationMessagesProps) => {
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    // Aqui seria implementada a lógica para enviar mensagem
    console.log('Enviando mensagem:', newMessage)
    setNewMessage("")
  }

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <MessageCircle className="h-4 w-4" />
          <span>Mensagens ({conversation.messages?.length || 0})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
          {conversation.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((message, index) => (
              <div key={index} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {message.sender_type === 'contact' ? 'C' : 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {message.sender_type === 'contact' ? conversation.contact?.name || 'Contato' : 'Agente'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.created_at && formatDistanceToNow(new Date(message.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  <p className="text-sm">{message.content || 'Mensagem sem conteúdo'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma mensagem encontrada
            </p>
          )}
        </div>

        <Separator className="my-4" />

        {/* Campo de nova mensagem */}
        <div className="space-y-3">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
