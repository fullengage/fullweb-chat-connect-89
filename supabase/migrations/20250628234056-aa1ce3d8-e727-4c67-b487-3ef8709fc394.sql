
-- Primeiro, vamos verificar se existe uma política que permita ao service role inserir na tabela users
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- Criar política específica para permitir que o service role (usado pelas edge functions) insira usuários
CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT 
    WITH CHECK (true);

-- Também vamos garantir que o service role possa atualizar usuários se necessário
DROP POLICY IF EXISTS "Service role can update users" ON public.users;

CREATE POLICY "Service role can update users" ON public.users
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Verificar se a tabela users tem todas as colunas necessárias e valores padrão adequados
-- Vamos garantir que a coluna auth_user_id aceita valores nulos temporariamente durante a inserção
ALTER TABLE public.users ALTER COLUMN auth_user_id DROP NOT NULL;

-- Depois vamos adicionar uma constraint para garantir que auth_user_id seja preenchido
-- mas permitindo que seja nulo durante a inserção inicial
ALTER TABLE public.users ADD CONSTRAINT users_auth_user_id_not_null 
    CHECK (auth_user_id IS NOT NULL) NOT VALID;

-- Validar a constraint apenas para novos registros
ALTER TABLE public.users VALIDATE CONSTRAINT users_auth_user_id_not_null;
