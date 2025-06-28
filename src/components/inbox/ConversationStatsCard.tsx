
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Conversation } from "@/types"

interface ConversationStatsCardProps {
  conversation: Conversation
}

export const ConversationStatsCard = ({ conversation }: ConversationStatsCardProps) => {
  return (
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
  )
}
