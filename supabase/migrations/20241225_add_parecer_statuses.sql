-- Add new statuses to the enum
ALTER TYPE status_documento ADD VALUE IF NOT EXISTS 'Emitido';
ALTER TYPE status_documento ADD VALUE IF NOT EXISTS 'Lido';
