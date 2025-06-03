
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Paperclip, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EmailCardProps {
  email: {
    id: string
    from: string
    fromName: string
    subject: string
    preview: string
    date: Date
    isRead: boolean
    isImportant: boolean
    hasAttachments: boolean
  }
  onClick: () => void
}

export const EmailCard = ({ email, onClick }: EmailCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
        !email.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {getInitials(email.fromName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!email.isRead ? 'font-semibold' : 'font-medium'}`}>
                  {email.fromName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {email.from}
                </span>
                {email.isImportant && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {email.hasAttachments && (
                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(email.date, { addSuffix: true, locale: ptBR })}
                </span>
                {!email.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            </div>
            
            <h4 className={`text-sm mb-1 ${!email.isRead ? 'font-semibold' : 'font-medium'}`}>
              {email.subject}
            </h4>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {email.preview}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
