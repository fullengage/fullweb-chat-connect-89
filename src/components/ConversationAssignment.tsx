
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { User as UserType } from "@/hooks/useSupabaseData"

interface ConversationAssignmentProps {
  conversationId: number
  currentAssignee?: {
    id: string
    name: string
    avatar_url?: string
  }
  agents: UserType[]
  onAssignmentChange?: () => void
}

export const ConversationAssignment = ({
  conversationId,
  currentAssignee,
  agents,
  onAssignmentChange
}: ConversationAssignmentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)
  const { toast } = useToast()

  const handleAssign = async () => {
    if (!selectedAgentId) return

    setIsAssigning(true)
    
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          assignee_id: selectedAgentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) throw error

      toast({
        title: "Conversa atribuída",
        description: "A conversa foi atribuída com sucesso ao agente.",
      })

      setIsOpen(false)
      setSelectedAgentId("")
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error assigning conversation:', error)
      toast({
        title: "Erro ao atribuir conversa",
        description: "Não foi possível atribuir a conversa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async () => {
    setIsAssigning(true)
    
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          assignee_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) throw error

      toast({
        title: "Atribuição removida",
        description: "A conversa foi desatribuída com sucesso.",
      })

      setIsOpen(false)
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error unassigning conversation:', error)
      toast({
        title: "Erro ao desatribuir conversa",
        description: "Não foi possível desatribuir a conversa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  if (currentAssignee) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-0 text-left justify-start hover:bg-transparent"
          >
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3" />
              <span className="text-xs text-gray-600">{currentAssignee.name}</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Atribuição</DialogTitle>
            <DialogDescription>
              Esta conversa está atribuída a {currentAssignee.name}. Você pode reatribuir ou remover a atribuição.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reatribuir para:</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar agente" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between space-x-2">
              <Button 
                variant="outline" 
                onClick={handleUnassign}
                disabled={isAssigning}
              >
                Remover Atribuição
              </Button>
              <Button 
                onClick={handleAssign}
                disabled={!selectedAgentId || isAssigning}
              >
                {isAssigning ? "Atribuindo..." : "Reatribuir"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-0 text-left justify-start hover:bg-blue-50 text-blue-600"
        >
          <div className="flex items-center space-x-2">
            <UserPlus className="h-3 w-3" />
            <span className="text-xs">Atribuir agente</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Conversa</DialogTitle>
          <DialogDescription>
            Selecione um agente para atribuir esta conversa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar agente:</label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolher agente" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} ({agent.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedAgentId || isAssigning}
            >
              {isAssigning ? "Atribuindo..." : "Atribuir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
