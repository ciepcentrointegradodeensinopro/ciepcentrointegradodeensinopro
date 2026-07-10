-- O formulário de upload de materiais (app/materials/upload) grava um campo
-- "turma" que nunca foi criado na tabela materials — só em profiles (migration
-- 20240401000000). Sem esta coluna, o insert falha ou o dado é descartado.

ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS turma TEXT;
