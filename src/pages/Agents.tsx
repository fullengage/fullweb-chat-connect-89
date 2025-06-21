
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search } from "lucide-react";
import { AgentStats } from "@/components/AgentStats";
import { AgentsList } from "@/components/AgentsList";

const Agents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agentes</h1>
                    <p className="text-gray-600">Gerencie sua equipe de atendimento</p>
                  </div>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agente
              </Button>
            </div>

            {/* Stats Cards */}
            <AgentStats />

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar agentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as funções</SelectItem>
                  <SelectItem value="agent">Agente</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="administrator">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agents List */}
            <AgentsList searchTerm={searchTerm} roleFilter={roleFilter} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Agents;
