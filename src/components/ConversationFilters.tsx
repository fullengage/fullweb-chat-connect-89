
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { User } from "@/hooks/useSupabaseData"

interface ConversationFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  assigneeFilter: string
  onAssigneeFilterChange: (filter: string) => void
  agents: User[]
  onRefresh: () => void
}

export const ConversationFilters = ({
  searchQuery,
  onSearchChange,
  assigneeFilter,
  onAssigneeFilterChange,
  agents,
  onRefresh
}: ConversationFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar conversas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full sm:w-64"
        />
      </div>
      
      <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filtrar por responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os responsáveis</SelectItem>
          <SelectItem value="unassigned">Não atribuídos</SelectItem>
          {agents
            .filter(agent => {
              const isValid = agent && 
                             agent.id && 
                             typeof agent.id === 'string' &&
                             agent.id.trim() !== '' &&
                             agent.name && 
                             agent.name.trim() !== ''
              
              if (!isValid) {
                console.error('ConversationFilters - About to render invalid SelectItem:', agent)
              }
              
              return isValid
            })
            .map((agent) => {
              console.log('ConversationFilters - Rendering SelectItem for agent:', { 
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

      <Button onClick={onRefresh} variant="outline">
        <Filter className="h-4 w-4 mr-2" />
        Atualizar
      </Button>
    </div>
  )
}
