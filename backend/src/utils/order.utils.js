function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `CMD-${new Date().getFullYear()}-${timestamp}-${random}`;
}

module.exports = {
  generateOrderNumber,
};
