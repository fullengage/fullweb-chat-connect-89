
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  MessageCircle, 
  Clock, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  TrendingUp,
  MessageSquare
} from "lucide-react"
import { Conversation } from "@/types"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useConversations } from "@/hooks/useSupabaseData"

interface ConversationHistoryModalProps {
  conversation: Conversation | null
  isOpen: boolean
  onClose: () => void
}

export const ConversationHistoryModal = ({ 
  conversation, 
  isOpen, 
  onClose 
}: ConversationHistoryModalProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Buscar todas as conversas do mesmo contato
  const { data: allConversations = [] } = useConversations({
    account_id: conversation?.account_id || 1
  })

  if (!conversation) return null

  const contactConversations = allConversations.filter(
    conv => conv.contact?.id === conversation.contact?.id
  )

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

  const stats = {
    totalConversations: contactConversations.length,
    openConversations: contactConversations.filter(c => c.status === 'open').length,
    resolvedConversations: contactConversations.filter(c => c.status === 'resolved').length,
    totalMessages: contactConversations.reduce((acc, conv) => acc + (conv.messages?.length || 0), 0),
    lastContact: contactConversations.length > 0 
      ? contactConversations.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0].updated_at
      : null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.contact?.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                {conversation.contact?.name?.charAt(0).toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {conversation.contact?.name || 'Contato Desconhecido'}
              </h2>
              <p className="text-sm text-gray-500">Histórico do Cliente</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="conversations">Conversas</TabsTrigger>
            <TabsTrigger value="contact-info">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalConversations}</div>
                  <div className="text-sm text-gray-600">Total de Conversas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.resolvedConversations}</div>
                  <div className="text-sm text-gray-600">Resolvidas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.openConversations}</div>
                  <div className="text-sm text-gray-600">Em Aberto</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalMessages}</div>
                  <div className="text-sm text-gray-600">Mensagens</div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Resumo do Contato</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {conversation.contact?.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{conversation.contact.email}</span>
                      </div>
                    )}
                    
                    {conversation.contact?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{conversation.contact.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Cliente desde {format(new Date(conversation.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {stats.lastContact && (
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          Último contato: {formatDistanceToNow(new Date(stats.lastContact), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Taxa de resolução: {stats.totalConversations > 0 
                          ? Math.round((stats.resolvedConversations / stats.totalConversations) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <div className="space-y-4">
              {contactConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma conversa encontrada</p>
                </div>
              ) : (
                contactConversations
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .map((conv) => (
                    <Card key={conv.id} className={conv.id === conversation.id ? 'border-blue-500 bg-blue-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${getStatusColor(conv.status)}`}>
                                {getStatusText(conv.status)}
                              </Badge>
                              {conv.id === conversation.id && (
                                <Badge variant="outline" className="text-xs">
                                  Atual
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(conv.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="h-4 w-4 text-gray-400" />
                              <span>{conv.messages?.length || 0} mensagens</span>
                            </div>
                            
                            {conv.assignee && (
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">{conv.assignee.name}</span>
                              </div>
                            )}
                          </div>

                          {conv.subject && (
                            <div className="text-sm text-gray-700">
                              <strong>Assunto:</strong> {conv.subject}
                            </div>
                          )}

                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>
                              Duração: {formatDistanceToNow(new Date(conv.created_at), { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="contact-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome</label>
                      <p className="text-sm text-gray-900">{conversation.contact?.name || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{conversation.contact?.email || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Telefone</label>
                      <p className="text-sm text-gray-900">{conversation.contact?.phone || 'Não informado'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Primeiro Contato</label>
                      <p className="text-sm text-gray-900">
                        {format(new Date(conversation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Última Atividade</label>
                      <p className="text-sm text-gray-900">
                        {format(new Date(conversation.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Canal de Comunicação</label>
                      <p className="text-sm text-gray-900">{conversation.inbox?.name || 'Chat Interno'}</p>
                    </div>
                  </div>
                </div>

                {conversation.contact?.additional_attributes && 
                 Object.keys(conversation.contact.additional_attributes).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Informações Adicionais
                      </label>
                      <div className="space-y-2">
                        {Object.entries(conversation.contact.additional_attributes).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-sm text-gray-600 capitalize">{key}:</span>
                            <span className="text-sm text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
