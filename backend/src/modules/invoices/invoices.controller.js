const prisma = require('../../config/database');
const { buildInvoicePdf } = require('./invoice-pdf.service');
const { buildWorkbookBuffer } = require('./invoice-export.service');
const {
  parsePagination,
  buildPaginationResponse,
  applyDateRangeFilter,
} = require('../../utils/pagination.utils');

// ---------------------------------------------------------------------------
// Include commun
// ---------------------------------------------------------------------------
const invoiceInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      guestName: true,
      guestEmail: true,
      guestPhone: true,       // ✅ ajout
      shippingAddress: true,  // ✅ ajout — contient phone, fullName, street, city
      paymentStatus: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,        // ✅ ajout
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildInvoicesWhere(query) {
  const where = {};
  if (query.status) where.status = query.status;

  if (query.search) {
    const s = String(query.search).trim();
    where.OR = [
      { invoiceNumber: { contains: s, mode: 'insensitive' } },
      { order: { orderNumber: { contains: s, mode: 'insensitive' } } },
      { order: { guestName: { contains: s, mode: 'insensitive' } } },
      { order: { guestEmail: { contains: s, mode: 'insensitive' } } },
    ];
  }

  applyDateRangeFilter(where, 'issuedAt', query);
  return where;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------
async function listInvoices(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = buildInvoicesWhere(req.query);

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
        include: invoiceInclude,
      }),
    ]);

    res.json(buildPaginationResponse({ data: invoices, total, page, limit }));
  } catch (err) {
    next(err);
  }
}

async function exportInvoicesExcel(req, res, next) {
  try {
    const where = buildInvoicesWhere(req.query);
    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { issuedAt: 'desc' },
      include: invoiceInclude,
      take: 5000,
    });

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'Aucune facture à exporter pour ces filtres.' });
    }

    const buffer = buildWorkbookBuffer(invoices);
    const datePart = new Date().toISOString().slice(0, 10);
    const filename = `factures-${datePart}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function getInvoiceByOrder(req, res, next) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { orderId: req.params.orderId },
      include: {
        order: {
          include: {
            items: true,
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Facture introuvable pour cette commande.' });
    }

    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

async function getInvoiceById(req, res, next) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        order: {
          include: {
            items: true,
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Facture introuvable.' });
    }

    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

async function downloadInvoicePdf(req, res, next) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        order: {
          include: {
            items: true,
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Facture introuvable.' });
    }

    const pdfBuffer = await buildInvoicePdf(invoice);
    const filename = `${invoice.invoiceNumber}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listInvoices,
  exportInvoicesExcel,
  getInvoiceByOrder,
  getInvoiceById,
  downloadInvoicePdf,
  buildInvoicesWhere,
};