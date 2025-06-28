
import {
  DndContext,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"
import { ConversationForStats } from "@/types"
import { statusColumns } from "./KanbanStatusColumns"
import { useKanbanBoardLogic } from "./KanbanBoardLogic"

interface KanbanBoardProps {
  conversations: ConversationForStats[]
  onConversationClick: (conversation: ConversationForStats) => void
  onStatusChange?: (conversationId: number, newStatus: string) => void
  isLoading?: boolean
}

export const KanbanBoard = ({ 
  conversations, 
  onConversationClick, 
  onStatusChange,
  isLoading 
}: KanbanBoardProps) => {
  const {
    sensors,
    activeConversation,
    isDragging,
    conversationsByStatus,
    handleDragStart,
    handleDragEnd
  } = useKanbanBoardLogic({ conversations, onStatusChange })

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
