
import { Clock, AlertCircle, CheckCircle, Users } from "lucide-react"

export const statusColumns = [
  {
    id: "open",
    title: "Abertas",
    icon: Clock,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    status: "open"
  },
  {
    id: "pending",
    title: "Pendentes", 
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    status: "pending"
  },
  {
    id: "resolved",
    title: "Resolvidas",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    status: "resolved"
  },
  {
    id: "unassigned",
    title: "Não Atribuídas",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    status: "open" // Unassigned conversations keep their current status
  }
]
