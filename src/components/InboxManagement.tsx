
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Inbox, Plus, Settings, Users, MessageCircle } from "lucide-react"
import { useInboxes } from "@/hooks/useSupabaseData"

interface InboxManagementProps {
  accountId: number
}

export const InboxManagement = ({ accountId }: InboxManagementProps) => {
  const [selectedInbox, setSelectedInbox] = useState<number | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newInboxName, setNewInboxName] = useState("")
  const [newInboxType, setNewInboxType] = useState("")

  const {
    data: inboxes = [],
    isLoading,
    error
  } = useInboxes(accountId)

  const getChannelTypeText = (channelType: string) => {
    switch (channelType) {
      case 'whatsapp':
        return 'WhatsApp'
      case 'email':
        return 'Email'
      case 'webchat':
        return 'Web Chat'
      default:
        return channelType
    }
  }

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'whatsapp':
        return '💬'
      case 'email':
        return '📧'
      case 'webchat':
        return '🌐'
      default:
        return '💬'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Inbox className="h-5 w-5" />
            <span>Gerenciar Caixas de Entrada</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Inbox className="h-5 w-5" />
            <span>Gerenciar Caixas de Entrada</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Erro ao carregar caixas de entrada</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Inbox className="h-5 w-5" />
            <span>Gerenciar Caixas de Entrada</span>
            <Badge variant="outline">{inboxes.length} total</Badge>
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Caixa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Caixa de Entrada</DialogTitle>
                <DialogDescription>
                  Configure uma nova caixa de entrada para seu atendimento.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Caixa</Label>
                  <Input
                    id="name"
                    value={newInboxName}
                    onChange={(e) => setNewInboxName(e.target.value)}
                    placeholder="Ex: Suporte Técnico"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Canal</Label>
                  <Select value={newInboxType} onValueChange={setNewInboxType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="webchat">Web Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  // Aqui seria implementada a lógica para criar uma nova caixa
                  console.log('Criar caixa:', { name: newInboxName, type: newInboxType })
                  setIsCreateDialogOpen(false)
                  setNewInboxName("")
                  setNewInboxType("")
                }}>
                  Criar Caixa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inboxes.map((inbox) => (
              <TableRow key={inbox.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getChannelIcon(inbox.channel_type)}</span>
                    <div>
                      <div className="font-medium">{inbox.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {inbox.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getChannelTypeText(inbox.channel_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="default">
                    Ativo
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedInbox(inbox.id)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
