
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, BarChart3, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Painel de Atendimento
            <span className="text-blue-600"> ao Cliente</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Otimize suas operações de suporte ao cliente com integração em tempo real do Chatwoot, 
            filtragem avançada e análises abrangentes em um painel unificado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-4">
              <Link to="/dashboard">
                <MessageSquare className="mr-2 h-5 w-5" />
                Abrir Painel
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
              <a href="https://www.chatwoot.com/" target="_blank" rel="noopener noreferrer">
                Saiba mais sobre o Chatwoot
              </a>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Conversas em Tempo Real</CardTitle>
              <CardDescription>
                Monitore todas as conversas dos clientes em múltiplos canais em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Atualizações de conversa ao vivo</li>
                <li>• Suporte a múltiplos canais</li>
                <li>• Acompanhamento de status de mensagens</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Análises Avançadas</CardTitle>
              <CardDescription>
                Obtenha insights sobre o desempenho da sua equipe e métricas de conversas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Estatísticas de conversas</li>
                <li>• Acompanhamento de tempo de resposta</li>
                <li>• Desempenho dos atendentes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Filtragem Inteligente</CardTitle>
              <CardDescription>
                Filtre conversas por status, atendente, canal e muito mais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Filtragem por status</li>
                <li>• Atribuição de atendentes</li>
                <li>• Categorização por canal</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Zap className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Suporte a Múltiplas Empresas
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Gerencie múltiplas empresas e contas de um único painel. 
            Alterne entre diferentes contas do Chatwoot facilmente e mantenha 
            visibilidade completa de toda sua operação de atendimento ao cliente.
          </p>
          <Button asChild>
            <Link to="/dashboard">
              Começar Agora
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
