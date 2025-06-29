
-- Políticas RLS para CONVERSATIONS
-- Garantir que usuários só vejam conversas da sua conta ou atribuídas a eles

-- Clientes só veem conversas onde são o contato
CREATE POLICY "Clients can view own conversations" ON public.conversations
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'cliente' 
        AND contact_id IN (
            SELECT id FROM public.contacts 
            WHERE email = (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        )
    );

-- Agentes veem conversas atribuídas a eles ou não atribuídas da sua conta
CREATE POLICY "Agents can view assigned conversations" ON public.conversations
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'agent' 
        AND account_id = public.get_user_account_id(auth.uid())
        AND (assignee_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR assignee_id IS NULL)
    );

-- Admins veem todas as conversas da sua conta
CREATE POLICY "Admins can view account conversations" ON public.conversations
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'admin' 
        AND account_id = public.get_user_account_id(auth.uid())
    );

-- Superadmins veem todas as conversas
CREATE POLICY "Superadmins can view all conversations" ON public.conversations
    FOR SELECT USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Service role para operações do sistema
CREATE POLICY "Service role can manage conversations" ON public.conversations
    FOR ALL USING (current_user = 'service_role');

-- Políticas RLS para MESSAGES
-- Mensagens seguem as mesmas regras das conversas

-- Clientes só veem mensagens das suas conversas
CREATE POLICY "Clients can view own messages" ON public.messages
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'cliente' 
        AND conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE contact_id IN (
                SELECT id FROM public.contacts 
                WHERE email = (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
            )
        )
    );

-- Agentes veem mensagens das conversas atribuídas a eles
CREATE POLICY "Agents can view assigned messages" ON public.messages
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'agent' 
        AND conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE account_id = public.get_user_account_id(auth.uid())
            AND (assignee_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR assignee_id IS NULL)
        )
    );

-- Admins veem mensagens da sua conta
CREATE POLICY "Admins can view account messages" ON public.messages
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'admin' 
        AND conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE account_id = public.get_user_account_id(auth.uid())
        )
    );

-- Superadmins veem todas as mensagens
CREATE POLICY "Superadmins can view all messages" ON public.messages
    FOR SELECT USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Service role para operações do sistema
CREATE POLICY "Service role can manage messages" ON public.messages
    FOR ALL USING (current_user = 'service_role');

-- Políticas RLS para CONTACTS
-- Contatos seguem regras similares às conversas

-- Clientes só veem o próprio contato
CREATE POLICY "Clients can view own contact" ON public.contacts
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'cliente' 
        AND email = (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Agentes veem contatos da sua conta
CREATE POLICY "Agents can view account contacts" ON public.contacts
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'agent' 
        AND account_id = public.get_user_account_id(auth.uid())
    );

-- Admins veem contatos da sua conta
CREATE POLICY "Admins can view account contacts" ON public.contacts
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'admin' 
        AND account_id = public.get_user_account_id(auth.uid())
    );

-- Superadmins veem todos os contatos
CREATE POLICY "Superadmins can view all contacts" ON public.contacts
    FOR SELECT USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Service role para operações do sistema
CREATE POLICY "Service role can manage contacts" ON public.contacts
    FOR ALL USING (current_user = 'service_role');

-- Habilitar RLS nas tabelas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
