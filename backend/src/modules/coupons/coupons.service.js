const prisma = require('../../config/database');

async function validateCoupon(code, orderAmount) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) {
    const error = new Error('Code promo invalide ou expiré.');
    error.status = 400;
    throw error;
  }
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    const error = new Error('Code promo expiré.');
    error.status = 400;
    throw error;
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    const error = new Error('Code promo épuisé.');
    error.status = 400;
    throw error;
  }
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    const error = new Error(`Montant minimum requis : ${coupon.minOrderAmount} FCFA`);
    error.status = 400;
    throw error;
  }

  const discount = coupon.type === 'PERCENTAGE'
    ? Math.floor(orderAmount * coupon.value / 100)
    : coupon.value;

  return { coupon, discount };
}

async function getCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
}

async function createCoupon(data) {
  return prisma.coupon.create({ data });
}

async function updateCoupon(id, data) {
  return prisma.coupon.update({ where: { id }, data });
}

async function deleteCoupon(id) {
  return prisma.coupon.delete({ where: { id } });
}

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };