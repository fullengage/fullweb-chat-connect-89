
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "@/hooks/useSupabaseData"

interface Inbox {
  id: number
  name: string
  channel_type: string
}

interface ConversationPageFiltersProps {
  accountId: string
  onAccountIdChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  assigneeId: string
  onAssigneeIdChange: (value: string) => void
  inboxId: string
  onInboxIdChange: (value: string) => void
  agents: User[]
  inboxes: Inbox[]
  currentUser: any
  agentsLoading: boolean
  inboxesLoading: boolean
}

export const ConversationPageFilters = ({
  accountId,
  onAccountIdChange,
  status,
  onStatusChange,
  assigneeId,
  onAssigneeIdChange,
  inboxId,
  onInboxIdChange,
  agents,
  inboxes,
  currentUser,
  agentsLoading,
  inboxesLoading
}: ConversationPageFiltersProps) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtros</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Papel: <span className="font-medium capitalize">{currentUser?.role}</span>
          </span>
          {currentUser?.account_id && (
            <span className="text-sm text-gray-500">
              Conta: <span className="font-medium">{currentUser.account_id}</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campo ID da Conta - só visível para superadmin */}
        {currentUser?.role === 'superadmin' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">ID da Conta</label>
            <Input
              placeholder="Digite o ID da conta"
              value={accountId}
              onChange={(e) => onAccountIdChange(e.target.value)}
              type="number"
              className="h-9"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="open">Abertas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="resolved">Resolvidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Responsável</label>
          <Select value={assigneeId} onValueChange={onAssigneeIdChange} disabled={agentsLoading}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione o responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Responsáveis</SelectItem>
              <SelectItem value="unassigned">Não Atribuído</SelectItem>
              {agents
                .filter(agent => {
                  const isValid = agent && 
                                 agent.id && 
                                 typeof agent.id === 'string' &&
                                 agent.id.trim() !== '' &&
                                 agent.name && 
                                 agent.name.trim() !== ''
                  
                  if (!isValid) {
                    console.error('ConversationPageFilters - About to render invalid SelectItem:', agent)
                  }
                  
                  return isValid
                })
                .map((agent) => {
                  console.log('ConversationPageFilters - Rendering SelectItem for agent:', { 
                    id: agent.id, 
                    name: agent.name 
                  })
                  
                  return (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  )
                })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Canal</label>
          <Select value={inboxId} onValueChange={onInboxIdChange} disabled={inboxesLoading}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione o canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Canais</SelectItem>
              {inboxes
                .filter(inbox => {
                  const isValid = inbox && 
                                 inbox.id && 
                                 inbox.name && 
                                 inbox.name.trim() !== ''
                  
                  if (!isValid) {
                    console.error('ConversationPageFilters - About to render invalid inbox SelectItem:', inbox)
                  }
                  
                  return isValid
                })
                .map((inbox) => (
                  <SelectItem key={inbox.id} value={inbox.id.toString()}>
                    {inbox.name} ({inbox.channel_type})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
