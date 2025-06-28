
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
  )
}
