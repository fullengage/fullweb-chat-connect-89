
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
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"
import { Clock, AlertCircle, CheckCircle, Users, History } from "lucide-react"
import { ConversationForStats } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface KanbanBoardProps {
  conversations: ConversationForStats[]
  onConversationClick: (conversation: ConversationForStats) => void
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
  const [activeConversation, setActiveConversation] = useState<ConversationForStats | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Organizar conversas por status
  const conversationsByStatus = {
    open: conversations.filter(c => c.status === 'open' && c.assignee),
    pending: conversations.filter(c => c.status === 'pending' && c.assignee),
    resolved: conversations.filter(c => c.status === 'resolved' && c.assignee),
    unassigned: conversations.filter(c => !c.assignee)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
    const conversation = conversations.find(c => c.id.toString() === event.active.id)
    setActiveConversation(conversation || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    setActiveConversation(null)
    
    const { active, over } = event
    
    if (!over) return

    const conversationId = parseInt(active.id.toString())
    const newColumnId = over.id.toString()
    const conversation = conversations.find(c => c.id === conversationId)

    if (!conversation) return

    // Determinar o novo status baseado na coluna
    let newStatus = newColumnId
    if (newColumnId === 'unassigned') {
      // Se movido para não atribuídas, manter status atual mas remover assignee
      toast({
        title: "Conversa não atribuída",
        description: "Para atribuir a conversa, use o menu de ações.",
        variant: "default",
      })
      return
    }

    // Validar se a mudança é válida
    if (conversation.status === newStatus) return

    // Aplicar regras de negócio
    if (conversation.status === 'resolved' && newStatus !== 'resolved') {
      toast({
        title: "Operação não permitida",
        description: "Conversas resolvidas não podem ser reabertas via Kanban. Use o menu de ações.",
        variant: "destructive",
      })
      return
    }

    // Se a conversa não tem assignee e não está indo para unassigned
    if (!conversation.assignee && newColumnId !== 'unassigned') {
      toast({
        title: "Conversa não atribuída",
        description: "Atribua a conversa a um agente antes de alterar o status.",
        variant: "destructive",
      })
      return
    }

    // Executar a mudança
    if (onStatusChange) {
      onStatusChange(conversationId, newStatus)
      
      // Log da mudança para histórico
      console.log(`Conversation ${conversationId} moved from ${conversation.status} to ${newStatus}`)
      
      toast({
        title: "Status atualizado",
        description: `Conversa movida para ${statusColumns.find(col => col.id === newStatus)?.title}`,
        variant: "default",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <div key={column.id} className={`${column.bgColor} ${column.borderColor} border-2 rounded-lg p-4 animate-pulse`}>
            <div className="h-6 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
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
                <div className="space-y-3 min-h-[400px]">
                  {columnConversations.map((conversation) => (
                    <KanbanCard
                      key={conversation.id}
                      id={conversation.id.toString()}
                      conversation={conversation}
                      onClick={() => onConversationClick(conversation)}
                      isDragging={activeConversation?.id === conversation.id && isDragging}
                    />
                  ))}
                  {columnConversations.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma conversa</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </KanbanColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeConversation && (
          <div className="rotate-2 opacity-90 transform scale-105 shadow-lg">
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
