-- 1. DROP the constraint FIRST to remove any restrictions
ALTER TABLE pareceres DROP CONSTRAINT IF EXISTS pareceres_status_check;

-- 2. Clean up invalid data (Now safe to do because there is no constraint)
UPDATE pareceres 
SET status = 'Rascunho' 
WHERE status NOT IN ('Rascunho', 'Finalizado', 'Emitido', 'Lido') 
   OR status IS NULL;

-- 3. Add the new constraint with expanded allowed values
ALTER TABLE pareceres ADD CONSTRAINT pareceres_status_check 
CHECK (status IN ('Rascunho', 'Finalizado', 'Emitido', 'Lido'));
