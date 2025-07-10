ALTER TABLE public.periodossessao
ADD COLUMN presidente_id BIGINT REFERENCES public.agentespublicos(id) ON DELETE SET NULL;