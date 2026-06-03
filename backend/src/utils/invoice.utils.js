async function nextInvoiceNumber(tx) {
  const year = new Date().getFullYear();
  const seq = await tx.invoiceSequence.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  const number = seq.lastNumber;
  return `FA-${year}-${String(number).padStart(4, '0')}`;
}

module.exports = { nextInvoiceNumber };
