
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Conversation } from "@/types"

interface ConversationContactInfoProps {
  conversation: Conversation
}

export const ConversationContactInfo = ({ conversation }: ConversationContactInfoProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Informações do Contato</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversation.contact?.email && (
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{conversation.contact.email}</span>
          </div>
        )}
        {conversation.contact?.phone && (
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{conversation.contact.phone}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            Criado {formatDistanceToNow(new Date(conversation.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
