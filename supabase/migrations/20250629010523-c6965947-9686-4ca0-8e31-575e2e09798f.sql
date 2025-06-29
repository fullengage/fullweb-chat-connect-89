
-- Limpar políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Clients can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Agents can view assigned conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can view account conversations" ON public.conversations;
DROP POLICY IF EXISTS "Superadmins can view all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Service role can manage conversations" ON public.conversations;

DROP POLICY IF EXISTS "Clients can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Agents can view assigned messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view account messages" ON public.messages;
DROP POLICY IF EXISTS "Superadmins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Service role can manage messages" ON public.messages;

DROP POLICY IF EXISTS "Clients can view own contact" ON public.contacts;
DROP POLICY IF EXISTS "Agents can view account contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view account contacts" ON public.contacts;
DROP POLICY IF EXISTS "Superadmins can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Service role can manage contacts" ON public.contacts;

DROP POLICY IF EXISTS "Superadmins can view accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can delete accounts" ON public.accounts;

DROP POLICY IF EXISTS "Agents can view account contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view account contacts" ON public.contacts;

-- Criar políticas RLS mais robustas e seguras

-- CONVERSATIONS: Isolamento rigoroso por account_id
CREATE POLICY "View conversations by account" ON public.conversations
    FOR SELECT USING (
        -- Superadmins veem tudo
        public.get_user_role(auth.uid()) = 'superadmin' 
        OR 
        -- Outros usuários só veem conversas da sua conta
        (account_id = public.get_user_account_id(auth.uid()) AND
         CASE 
           WHEN public.get_user_role(auth.uid()) = 'admin' THEN true
           WHEN public.get_user_role(auth.uid()) = 'agent' THEN 
             (assignee_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR assignee_id IS NULL)
           WHEN public.get_user_role(auth.uid()) = 'cliente' THEN 
             contact_id IN (
               SELECT id FROM public.contacts 
               WHERE email = (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
             )
           ELSE false
         END)
    );

CREATE POLICY "Insert conversations by account" ON public.conversations
    FOR INSERT WITH CHECK (
        public.get_user_role(auth.uid()) IN ('superadmin', 'admin', 'agent') AND
        (public.get_user_role(auth.uid()) = 'superadmin' OR account_id = public.get_user_account_id(auth.uid()))
    );

CREATE POLICY "Update conversations by account" ON public.conversations
    FOR UPDATE USING (
        public.get_user_role(auth.uid()) IN ('superadmin', 'admin', 'agent') AND
        (public.get_user_role(auth.uid()) = 'superadmin' OR account_id = public.get_user_account_id(auth.uid()))
    );

-- MESSAGES: Seguem as mesmas regras das conversas
CREATE POLICY "View messages by conversation access" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE
            public.get_user_role(auth.uid()) = 'superadmin' 
            OR 
            (account_id = public.get_user_account_id(auth.uid()) AND
             CASE 
               WHEN public.get_user_role(auth.uid()) = 'admin' THEN true
               WHEN public.get_user_role(auth.uid()) = 'agent' THEN 
                 (assignee_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR assignee_id IS NULL)
               WHEN public.get_user_role(auth.uid()) = 'cliente' THEN 
                 contact_id IN (
                   SELECT id FROM public.contacts 
                   WHERE email = (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
                 )
               ELSE false
             END)
        )
    );

CREATE POLICY "Insert messages by conversation access" ON public.messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE
            public.get_user_role(auth.uid()) IN ('superadmin', 'admin', 'agent', 'cliente') AND
            (public.get_user_role(auth.uid()) = 'superadmin' OR account_id = public.get_user_account_id(auth.uid()))
        )
    );

-- CONTACTS: Isolamento por account_id
CREATE POLICY "View contacts by account" ON public.contacts
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'superadmin' 
        OR 
        (account_id = public.get_user_account_id(auth.uid()) AND
         public.get_user_role(auth.uid()) IN ('admin', 'agent'))
        OR
        (public.get_user_role(auth.uid()) = 'cliente' AND 
         email = (SELECT email FROM public.users WHERE auth_user_id = auth.uid()))
    );

CREATE POLICY "Insert contacts by account" ON public.contacts
    FOR INSERT WITH CHECK (
        public.get_user_role(auth.uid()) IN ('superadmin', 'admin', 'agent') AND
        (public.get_user_role(auth.uid()) = 'superadmin' OR account_id = public.get_user_account_id(auth.uid()))
    );

CREATE POLICY "Update contacts by account" ON public.contacts
    FOR UPDATE USING (
        public.get_user_role(auth.uid()) IN ('superadmin', 'admin', 'agent') AND
        (public.get_user_role(auth.uid()) = 'superadmin' OR account_id = public.get_user_account_id(auth.uid()))
    );

-- INBOXES: Isolamento por account_id
CREATE POLICY "View inboxes by account" ON public.inboxes
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'superadmin' 
        OR 
        (account_id = public.get_user_account_id(auth.uid()) AND
         public.get_user_role(auth.uid()) IN ('admin', 'agent'))
    );

CREATE POLICY "Manage inboxes by account" ON public.inboxes
    FOR INSERT WITH CHECK (
        public.get_user_role(auth.uid()) IN ('superadmin', 'admin') AND
        (public.get_user_role(auth.uid()) = 'superadmin' OR account_id = public.get_user_account_id(auth.uid()))
    );

-- ACCOUNTS: Apenas superadmins
CREATE POLICY "Superadmins manage accounts" ON public.accounts
    FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Service role bypass para operações do sistema
CREATE POLICY "Service role bypass conversations" ON public.conversations FOR ALL USING (current_user = 'service_role');
CREATE POLICY "Service role bypass messages" ON public.messages FOR ALL USING (current_user = 'service_role');
CREATE POLICY "Service role bypass contacts" ON public.contacts FOR ALL USING (current_user = 'service_role');
CREATE POLICY "Service role bypass inboxes" ON public.inboxes FOR ALL USING (current_user = 'service_role');
CREATE POLICY "Service role bypass accounts" ON public.accounts FOR ALL USING (current_user = 'service_role');
