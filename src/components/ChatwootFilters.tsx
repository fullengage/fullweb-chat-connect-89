
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"

interface Agent {
  id: number
  name: string
  email: string
}

interface Inbox {
  id: number
  name: string
  channel_type: string
}

interface ChatwootFiltersProps {
  status: string
  assigneeId: string
  inboxId: string
  accountId: string
  onStatusChange: (status: string) => void
  onAssigneeChange: (assigneeId: string) => void
  onInboxChange: (inboxId: string) => void
  onAccountIdChange: (accountId: string) => void
  agents?: Agent[]
  inboxes?: Inbox[]
  isLoading?: boolean
}

export const ChatwootFilters = ({
  status,
  assigneeId,
  inboxId,
  accountId,
  onStatusChange,
  onAssigneeChange,
  onInboxChange,
  onAccountIdChange,
  agents = [],
  inboxes = [],
  isLoading = false
}: ChatwootFiltersProps) => {
  const clearFilters = () => {
    onStatusChange('all')
    onAssigneeChange('all')
    onInboxChange('all')
  }

  const activeFiltersCount = [status, assigneeId, inboxId].filter(f => f && f !== 'all').length

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {activeFiltersCount > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{activeFiltersCount} active</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Account ID</label>
          <Input
            placeholder="Enter account ID"
            value={accountId}
            onChange={(e) => onAccountIdChange(e.target.value)}
            type="number"
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Agent</label>
          <Select value={assigneeId} onValueChange={onAssigneeChange} disabled={isLoading}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id.toString()}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Channel</label>
          <Select value={inboxId} onValueChange={onInboxChange} disabled={isLoading}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {inboxes.map((inbox) => (
                <SelectItem key={inbox.id} value={inbox.id.toString()}>
                  {inbox.name} ({inbox.channel_type.replace('Channel::', '')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
