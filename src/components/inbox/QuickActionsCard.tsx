
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Tag } from "lucide-react"

export const QuickActionsCard = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Resolver Conversa
        </Button>
        
        <Button variant="outline" size="sm" className="w-full justify-start">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Marcar como Urgente
        </Button>
        
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Tag className="h-4 w-4 mr-2" />
          Adicionar Etiqueta
        </Button>
      </CardContent>
    </Card>
  )
}
