
-- Remover políticas existentes na tabela conversations se existirem
DROP POLICY IF EXISTS "Users can view conversations from their account" ON conversations;
DROP POLICY IF EXISTS "Agents can view assigned conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;

-- Criar políticas específicas para conversas baseadas no papel do usuário
-- Superadmins podem ver todas as conversas
CREATE POLICY "Superadmins can view all conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- Admins podem ver todas as conversas da sua conta
CREATE POLICY "Admins can view account conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.account_id = conversations.account_id
            AND users.role = 'admin'
        )
    );

-- Agentes podem ver apenas conversas atribuídas a eles
CREATE POLICY "Agents can view assigned conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.id = conversations.assignee_id
            AND users.role = 'agent'
        )
    );

-- Políticas para INSERT, UPDATE, DELETE para conversas
CREATE POLICY "Admins can insert conversations" ON conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.account_id = conversations.account_id
            AND users.role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admins can update conversations" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.account_id = conversations.account_id
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Agentes podem atualizar apenas suas conversas atribuídas
CREATE POLICY "Agents can update assigned conversations" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.id = conversations.assignee_id
            AND users.role = 'agent'
        )
    );

-- Políticas similares para mensagens
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;

CREATE POLICY "Superadmins can view all messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

CREATE POLICY "Admins can view messages from account conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN conversations c ON c.id = messages.conversation_id
            WHERE u.auth_user_id = auth.uid() 
            AND u.account_id = c.account_id
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Agents can view messages from assigned conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN conversations c ON c.id = messages.conversation_id
            WHERE u.auth_user_id = auth.uid() 
            AND u.id = c.assignee_id
            AND u.role = 'agent'
        )
    );

-- Políticas para inserir mensagens
CREATE POLICY "Agents can insert messages in assigned conversations" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            JOIN conversations c ON c.id = messages.conversation_id
            WHERE u.auth_user_id = auth.uid() 
            AND u.id = c.assignee_id
            AND u.role = 'agent'
        ) OR
        EXISTS (
            SELECT 1 FROM users u
            JOIN conversations c ON c.id = messages.conversation_id
            WHERE u.auth_user_id = auth.uid() 
            AND u.account_id = c.account_id
            AND u.role IN ('admin', 'superadmin')
        )
    );
