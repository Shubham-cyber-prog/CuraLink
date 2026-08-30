-- Link an account-backed doctor profile to the existing public doctor record.
-- `userId` remains nullable so legacy directory-only doctor records continue to work.
ALTER TABLE "doctors" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "doctors_userId_key" ON "doctors"("userId");

ALTER TABLE "doctors"
ADD CONSTRAINT "doctors_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
