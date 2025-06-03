
export interface EmailConfig {
  username: string
  password: string
  incomingServer: string
  outgoingServer: string
  protocol: 'IMAP' | 'POP3'
  imapPort: string
  smtpPort: string
  useSSL: boolean
}

export interface EmailMessage {
  id: string
  from: string
  fromName: string
  to: string
  subject: string
  preview: string
  body: string
  date: Date
  isRead: boolean
  isImportant: boolean
  hasAttachments: boolean
  folder: string
}

export class EmailService {
  private config: EmailConfig | null = null

  constructor() {
    this.loadConfig()
  }

  private loadConfig(): void {
    const savedConfig = localStorage.getItem('email_config')
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig)
      } catch (error) {
        console.error('Erro ao carregar configuração de email:', error)
      }
    }
  }

  saveConfig(config: EmailConfig): void {
    localStorage.setItem('email_config', JSON.stringify(config))
    this.config = config
  }

  getConfig(): EmailConfig | null {
    return this.config
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.config) {
      return {
        success: false,
        message: 'Configuração não encontrada'
      }
    }

    console.log('Testando conexão com:', {
      server: this.config.incomingServer,
      port: this.config.imapPort,
      username: this.config.username,
      protocol: this.config.protocol
    })

    try {
      // Simulação de teste de conexão
      // Em uma implementação real, isso faria uma conexão TCP/SSL
      const response = await this.simulateConnection()
      
      if (response.success) {
        return {
          success: true,
          message: 'Conexão estabelecida com sucesso',
          details: response.details
        }
      } else {
        return {
          success: false,
          message: response.message,
          details: response.details
        }
      }
    } catch (error) {
      console.error('Erro na conexão:', error)
      return {
        success: false,
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: { error }
      }
    }
  }

  private async simulateConnection(): Promise<{ success: boolean; message: string; details: any }> {
    // Simula diferentes cenários de conexão baseado na configuração
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simula delay de rede

    const { incomingServer, imapPort, username, password } = this.config!

    // Validações básicas
    if (!username || !password) {
      return {
        success: false,
        message: 'Credenciais incompletas',
        details: { error: 'Username ou password não fornecidos' }
      }
    }

    if (!incomingServer) {
      return {
        success: false,
        message: 'Servidor não configurado',
        details: { error: 'Servidor de entrada não especificado' }
      }
    }

    // Simula diferentes cenários baseado no servidor
    if (incomingServer.includes('fullweb.com.br')) {
      // Simula problemas comuns com este servidor
      if (password.length < 8) {
        return {
          success: false,
          message: 'Falha na autenticação - senha muito curta',
          details: { 
            error: 'AUTH_FAILED',
            suggestion: 'Verifique se está usando uma senha de aplicativo válida'
          }
        }
      }
      
      if (imapPort !== '993' && imapPort !== '143') {
        return {
          success: false,
          message: `Porta ${imapPort} não é suportada`,
          details: { 
            error: 'INVALID_PORT',
            suggestion: 'Use porta 993 para IMAP com SSL ou 143 para IMAP sem SSL'
          }
        }
      }

      return {
        success: true,
        message: 'Conexão simulada com sucesso',
        details: {
          server: incomingServer,
          port: imapPort,
          ssl: true,
          authenticated: true
        }
      }
    }

    // Para outros servidores
    return {
      success: false,
      message: 'Servidor não reconhecido ou não suportado',
      details: {
        error: 'UNKNOWN_SERVER',
        suggestion: 'Verifique as configurações do servidor'
      }
    }
  }

  async fetchEmails(): Promise<EmailMessage[]> {
    if (!this.config) {
      throw new Error('Configuração de email não encontrada')
    }

    const connectionTest = await this.testConnection()
    if (!connectionTest.success) {
      throw new Error(`Falha na conexão: ${connectionTest.message}`)
    }

    // Por enquanto, retorna emails mock após validar a conexão
    return this.getMockEmails()
  }

  private getMockEmails(): EmailMessage[] {
    return [
      {
        id: "1",
        from: "cliente@empresa.com",
        fromName: "João Silva",
        to: this.config?.username || "adm@fullweb.com.br",
        subject: "Dúvida sobre o produto",
        preview: "Gostaria de saber mais informações sobre os preços...",
        body: "Olá,\n\nGostaria de saber mais informações sobre os preços dos seus produtos. Poderia me enviar uma tabela completa?\n\nAguardo retorno.\n\nObrigado,\nJoão Silva",
        date: new Date(),
        isRead: false,
        isImportant: true,
        hasAttachments: false,
        folder: "inbox"
      },
      {
        id: "2",
        from: "contato@clienteabc.com.br",
        fromName: "Maria Santos",
        to: this.config?.username || "adm@fullweb.com.br",
        subject: "Proposta comercial",
        preview: "Seguem em anexo os documentos solicitados...",
        body: "Prezados,\n\nSeguem em anexo os documentos solicitados para a proposta comercial.\n\nAguardo retorno.\n\nAtenciosamente,\nMaria Santos",
        date: new Date(Date.now() - 86400000),
        isRead: true,
        isImportant: false,
        hasAttachments: true,
        folder: "inbox"
      }
    ]
  }
}

export const emailService = new EmailService()
