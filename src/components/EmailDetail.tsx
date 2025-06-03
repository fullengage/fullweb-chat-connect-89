
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Archive, 
  Trash2, 
  Star,
  Paperclip,
  Download
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EmailDetailProps {
  email: any
  isOpen: boolean
  onClose: () => void
}

export const EmailDetail = ({ email, isOpen, onClose }: EmailDetailProps) => {
  if (!email) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{email.subject}</span>
            <div className="flex items-center space-x-2 ml-4">
              {email.isImportant && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              <Badge variant={email.isRead ? "outline" : "default"}>
                {email.isRead ? "Lido" : "Não lido"}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header do email */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {getInitials(email.fromName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{email.fromName}</h3>
                  <p className="text-sm text-muted-foreground">{email.from}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {format(email.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(email.date, { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div className="mt-2 text-sm text-muted-foreground">
                <p><strong>Para:</strong> {email.to}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Anexos */}
          {email.hasAttachments && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm font-medium">Anexos</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-700">PDF</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">documento.pdf</p>
                      <p className="text-xs text-muted-foreground">245 KB</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Corpo do email */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {email.body}
            </div>
          </div>

          <Separator />

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm">
              <Reply className="h-3 w-3 mr-2" />
              Responder
            </Button>
            <Button size="sm" variant="outline">
              <ReplyAll className="h-3 w-3 mr-2" />
              Responder Todos
            </Button>
            <Button size="sm" variant="outline">
              <Forward className="h-3 w-3 mr-2" />
              Encaminhar
            </Button>
            <div className="flex-1" />
            <Button size="sm" variant="outline">
              <Archive className="h-3 w-3 mr-2" />
              Arquivar
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="h-3 w-3 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
