
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Conversation } from "@/types"

interface ContactInfoCardProps {
  conversation: Conversation
}

export const ContactInfoCard = ({ conversation }: ContactInfoCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center space-x-2">
          <User className="h-3 w-3" />
          <span>Contato</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={conversation.contact?.avatar_url} />
            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
              {conversation.contact?.name?.charAt(0)?.toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">
              {conversation.contact?.name || 'Contato Desconhecido'}
            </h4>
            <p className="text-xs text-gray-500">#{conversation.id}</p>
          </div>
        </div>

        {conversation.contact?.phone && (
          <div className="flex items-center text-xs text-gray-600">
            <Phone className="h-3 w-3 mr-1" />
            <span>{conversation.contact.phone}</span>
          </div>
        )}

        {conversation.contact?.email && (
          <div className="flex items-center text-xs text-gray-600">
            <Mail className="h-3 w-3 mr-1" />
            <span>{conversation.contact.email}</span>
          </div>
        )}

        <div className="flex items-center text-xs text-gray-600">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {format(new Date(conversation.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
