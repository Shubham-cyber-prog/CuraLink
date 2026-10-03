-- Rollback SQL for 20260928090000_add_appointment_utc_datetime
DROP INDEX IF EXISTS "appointments_doctorId_scheduledAt_idx";

ALTER TABLE "appointments" 
  DROP COLUMN IF EXISTS "durationMinutes",
  DROP COLUMN IF EXISTS "endTime",
  DROP COLUMN IF EXISTS "scheduledAt",
  DROP COLUMN IF EXISTS "timezone";
