-- Attribution publicitaire et état d'envoi Meta Conversions API.
ALTER TABLE `Order`
  ADD COLUMN `attribution` JSON NULL,
  ADD COLUMN `metaPurchaseEventId` VARCHAR(191) NULL,
  ADD COLUMN `metaPurchaseSentAt` DATETIME(3) NULL,
  ADD COLUMN `metaPurchaseLastError` VARCHAR(500) NULL;

CREATE UNIQUE INDEX `Order_metaPurchaseEventId_key`
  ON `Order`(`metaPurchaseEventId`);
