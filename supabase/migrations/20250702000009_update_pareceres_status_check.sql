-- 1. Sanitize Data: Update any existing rows that don't match the new allowed values
-- This prevents the constraint from failing when applied.
UPDATE pareceres 
SET status = 'Rascunho' 
WHERE status NOT IN ('Rascunho', 'Finalizado', 'Emitido', 'Lido') 
   OR status IS NULL;

-- 2. Drop the old constraint
ALTER TABLE pareceres DROP CONSTRAINT IF EXISTS pareceres_status_check;

-- 3. Add the new constraint with expanded allowed values
ALTER TABLE pareceres ADD CONSTRAINT pareceres_status_check 
CHECK (status IN ('Rascunho', 'Finalizado', 'Emitido', 'Lido'));
