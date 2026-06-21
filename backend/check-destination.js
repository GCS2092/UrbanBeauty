const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.order.findMany({ 
  select: { orderNumber: true, destination: true }, 
  take: 10, 
  orderBy: { createdAt: 'desc' } 
}).then(r => { 
  console.log(JSON.stringify(r, null, 2)); 
  p.$disconnect(); 
});