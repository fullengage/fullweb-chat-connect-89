
import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"
import { Clock, AlertCircle, CheckCircle, Users } from "lucide-react"

interface Conversation {
  id: number
  status: string
  unread_count: number
  contact: {
    id: number
    name: string
    email?: string
    avatar_url?: string
  }
  assignee?: {
    id: number
    name: string
    avatar_url?: string
  }
  inbox: {
    id: number
    name: string
    channel_type: string
  }
  updated_at: string
  messages: any[]
}

interface KanbanBoardProps {
  conversations: Conversation[]
  onConversationClick: (conversation: Conversation) => void
  onStatusChange?: (conversationId: number, newStatus: string) => void
  isLoading?: boolean
}

const statusColumns = [
  {
    id: "open",
    title: "Abertas",
    icon: Clock,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    id: "pending",
    title: "Pendentes",
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  {
    id: "resolved",
    title: "Resolvidas",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    id: "unassigned",
    title: "Não Atribuídas",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  }
]

export const KanbanBoard = ({ 
  conversations, 
  onConversationClick, 
  onStatusChange,
  isLoading 
}: KanbanBoardProps) => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Organizar conversas por status
  const conversationsByStatus = {
    open: conversations.filter(c => c.status === 'open'),
    pending: conversations.filter(c => c.status === 'pending'),
    resolved: conversations.filter(c => c.status === 'resolved'),
    unassigned: conversations.filter(c => !c.assignee)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const conversation = conversations.find(c => c.id.toString() === event.active.id)
    setActiveConversation(conversation || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveConversation(null)
    
    const { active, over } = event
    
    if (!over) return

    const conversationId = parseInt(active.id.toString())
    const newStatus = over.id.toString()

    // Se a conversa foi movida para uma nova coluna de status
    if (onStatusChange && statusColumns.some(col => col.id === newStatus)) {
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation && conversation.status !== newStatus && newStatus !== 'unassigned') {
        onStatusChange(conversationId, newStatus)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <Card key={column.id} className={`${column.bgColor} ${column.borderColor} border-2`}>
            <CardHeader className="pb-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => {
          const columnConversations = conversationsByStatus[column.id as keyof typeof conversationsByStatus] || []
          const Icon = column.icon
          
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              count={columnConversations.length}
              icon={<Icon className={`h-4 w-4 ${column.color}`} />}
              bgColor={column.bgColor}
              borderColor={column.borderColor}
            >
              <SortableContext
                items={columnConversations.map(c => c.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {columnConversations.map((conversation) => (
                    <KanbanCard
                      key={conversation.id}
                      id={conversation.id.toString()}
                      conversation={conversation}
                      onClick={() => onConversationClick(conversation)}
                    />
                  ))}
                </div>
              </SortableContext>
            </KanbanColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeConversation && (
          <div className="rotate-6 opacity-80">
            <KanbanCard
              id={activeConversation.id.toString()}
              conversation={activeConversation}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
