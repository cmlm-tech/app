CREATE TYPE public.partidos_politicos AS ENUM ('MDB', 'PDT', 'PSD');

ALTER TABLE public.legislaturavereadores
ALTER COLUMN partido TYPE public.partidos_politicos
USING partido::partidos_politicos;
