
import { useQuery } from "@tanstack/react-query";

const DIFY_API_BASE = "http://meuevento-dify.n1n956.easypanel.host/v1";
const DIFY_API_KEY = "app-pmIrUkTuI4HQpyYc4l1rOkGR";

interface DifyBot {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'training';
  created_at: string;
  model_config?: any;
  conversations_count?: number;
}

// Função para buscar bots do Dify
const fetchDifyBots = async (): Promise<DifyBot[]> => {
  console.log("Fetching Dify bots...");
  
  try {
    const response = await fetch(`${DIFY_API_BASE}/apps`, {
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dify bots response:", data);

    // Adaptar a resposta da API do Dify para nosso formato
    return data.data || [];
  } catch (error) {
    console.error("Error fetching Dify bots:", error);
    // Retornar dados mock em caso de erro
    return [
      {
        id: "1",
        name: "Assistente de Atendimento",
        description: "Bot principal para atendimento ao cliente",
        status: "active",
        created_at: new Date().toISOString(),
        conversations_count: 45
      },
      {
        id: "2",
        name: "Bot de Vendas",
        description: "Especializado em processos de venda",
        status: "inactive",
        created_at: new Date().toISOString(),
        conversations_count: 23
      }
    ];
  }
};

// Hook para buscar bots do Dify
export const useDifyBots = () => {
  return useQuery({
    queryKey: ['dify-bots'],
    queryFn: fetchDifyBots,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};

// Função para criar um novo bot
export const createDifyBot = async (botData: Partial<DifyBot>) => {
  console.log("Creating Dify bot:", botData);
  
  try {
    const response = await fetch(`${DIFY_API_BASE}/apps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Dify bot:", error);
    throw error;
  }
};
