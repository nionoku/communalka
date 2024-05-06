-- CreateTable
CREATE TABLE "GS_Accruals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accrual_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "accrual_date" TEXT NOT NULL,
    "receipt_path" TEXT,
    "area" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GS_Accruals_accrual_id_key" ON "GS_Accruals"("accrual_id");
