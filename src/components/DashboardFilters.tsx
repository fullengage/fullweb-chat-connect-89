
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { User } from "@/hooks/useSupabaseData"

interface Inbox {
  id: number
  name: string
  channel_type: string
}

interface LocalAgent {
  id: number
  name: string
  email: string
}

interface DashboardFiltersProps {
  status: string
  assigneeId: string
  inboxId: string
  accountId: string
  onStatusChange: (value: string) => void
  onAssigneeChange: (value: string) => void
  onInboxChange: (value: string) => void
  onAccountIdChange: (value: string) => void
  agents: User[]
  inboxes: Inbox[]
  agentsLoading: boolean
  inboxesLoading: boolean
}

export const DashboardFilters = ({
  status,
  assigneeId,
  inboxId,
  accountId,
  onStatusChange,
  onAssigneeChange,
  onInboxChange,
  onAccountIdChange,
  agents,
  inboxes,
  agentsLoading,
  inboxesLoading
}: DashboardFiltersProps) => {
  // ✅ Filtração rigorosa de agentes para ChatwootFilters
  const agentsForFilter: LocalAgent[] = agents
    .filter(user => {
      const isValid = user && 
                     user.id && 
                     typeof user.id === 'string' &&
                     user.id.trim() !== '' &&
                     user.name && 
                     user.name.trim() !== ''
      
      if (!isValid) {
        console.warn('DashboardFilters - Invalid agent filtered out:', user)
      }
      
      return isValid
    })
    .map((user: User, index: number) => ({
      id: index + 1, // Use index as number ID since ChatwootFilters expects number
      name: user.name,
      email: user.email
    }))

  console.log('DashboardFilters - Valid agents for filter:', agentsForFilter)

  return (
    <ChatwootFilters
      status={status}
      assigneeId={assigneeId}
      inboxId={inboxId}
      accountId={accountId}
      onStatusChange={onStatusChange}
      onAssigneeChange={onAssigneeChange}
      onInboxChange={onInboxChange}
      onAccountIdChange={onAccountIdChange}
      agents={agentsForFilter}
      inboxes={inboxes}
      isLoading={agentsLoading || inboxesLoading}
    />
  )
}
