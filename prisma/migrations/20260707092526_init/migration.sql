-- CreateTable
CREATE TABLE "Benutzer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "passwortHash" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "mailAbo" BOOLEAN NOT NULL DEFAULT true,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Projekt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titel" TEXT NOT NULL,
    "abteilung" TEXT NOT NULL,
    "ansprechperson" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startdatum" DATETIME NOT NULL,
    "naechsterTermin" DATETIME,
    "naechsterTerminLabel" TEXT,
    "kurzbeschrieb" TEXT NOT NULL,
    "wirkung" TEXT NOT NULL,
    "archiviert" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Update" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projektId" INTEGER NOT NULL,
    "datum" DATETIME NOT NULL,
    "kurztitel" TEXT NOT NULL,
    "detailtext" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENTWURF',
    "publiziertAm" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Update_projektId_fkey" FOREIGN KEY ("projektId") REFERENCES "Projekt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mailversand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "updateId" INTEGER NOT NULL,
    "empfaenger" TEXT NOT NULL,
    "gesendetAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    CONSTRAINT "Mailversand_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "Update" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Benutzer_email_key" ON "Benutzer"("email");

-- CreateIndex
CREATE INDEX "Projekt_archiviert_status_idx" ON "Projekt"("archiviert", "status");

-- CreateIndex
CREATE INDEX "Update_projektId_datum_idx" ON "Update"("projektId", "datum");
