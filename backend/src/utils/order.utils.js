function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000; // 4 chiffres : 1000-9999
  return `CMD-${year}-${random}`;
}

module.exports = {
  generateOrderNumber,
};