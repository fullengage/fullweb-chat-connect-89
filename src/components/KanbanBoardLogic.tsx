
import { useState } from "react"
import { DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { ConversationForStats } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { statusColumns } from "./KanbanStatusColumns"

interface UseKanbanBoardLogicProps {
  conversations: ConversationForStats[]
  onStatusChange?: (conversationId: number, newStatus: string) => void
}

export const useKanbanBoardLogic = ({ 
  conversations, 
  onStatusChange 
}: UseKanbanBoardLogicProps) => {
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

    // Find the column configuration
    const targetColumn = statusColumns.find(col => col.id === newColumnId)
    if (!targetColumn) return

    // Handle unassigned column specially
    if (newColumnId === 'unassigned') {
      toast({
        title: "Conversa não atribuída",
        description: "Para atribuir a conversa, use o menu de ações.",
        variant: "default",
      })
      return
    }

    // Get the actual status to save
    const newStatus = targetColumn.status

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
      console.log(`Moving conversation ${conversationId} from ${conversation.status} to ${newStatus}`)
      onStatusChange(conversationId, newStatus)
      
      toast({
        title: "Status atualizado",
        description: `Conversa movida para ${targetColumn.title}`,
        variant: "default",
      })
    }
  }

  return {
    sensors,
    activeConversation,
    isDragging,
    conversationsByStatus,
    handleDragStart,
    handleDragEnd
  }
}
