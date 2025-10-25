/**
 * Prisma 数据库种子文件
 * 用于初始化开发环境的测试数据
 */

import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建公司
  const company = await prisma.company.create({
    data: {
      name: '测试公司',
      licenseNo: 'TEST-2025-001',
      phone: '13800138000',
      email: 'company@example.com',
      address: '北京市朝阳区',
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date('2026-12-31'),
      maxUsers: 50,
      maxProducts: 10000,
    },
  });

  console.log('✅ 公司创建成功:', company.id);

  // 创建用户
  const hashedPassword = await bcryptjs.hash('Admin@123456', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      name: '管理员',
      phone: '13800138001',
      companyId: company.id,
      role: 'admin',
      status: 'active',
    },
  });

  console.log('✅ 用户创建成功:', user.id);

  // 创建客户
  const customer1 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: '张三',
      phone: '13800138002',
      email: 'zhangsan@example.com',
      category: 'VIP',
      creditLimit: 100000,
      address: '北京市朝阳区建国路',
      createdBy: user.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: '李四',
      phone: '13800138003',
      email: 'lisi@example.com',
      category: '普通',
      creditLimit: 50000,
      address: '北京市朝阳区东三环',
      createdBy: user.id,
    },
  });

  console.log('✅ 客户创建成功:', customer1.id, customer2.id);

  // 创建产品
  const product1 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: '产品 A',
      sku: 'SKU-001',
      category: '电子产品',
      unit: '件',
      unitPrice: 1000,
      costPrice: 600,
      specs: '规格: 10cm x 10cm',
      description: '这是产品 A 的描述',
      createdBy: user.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: '产品 B',
      sku: 'SKU-002',
      category: '电子产品',
      unit: '盒',
      unitPrice: 2000,
      costPrice: 1200,
      specs: '规格: 20cm x 20cm',
      description: '这是产品 B 的描述',
      createdBy: user.id,
    },
  });

  console.log('✅ 产品创建成功:', product1.id, product2.id);

  // 创建库存
  await prisma.inventory.create({
    data: {
      companyId: company.id,
      productId: product1.id,
      quantity: 1000,
      reserved: 0,
      warningLevel: 100,
    },
  });

  await prisma.inventory.create({
    data: {
      companyId: company.id,
      productId: product2.id,
      quantity: 500,
      reserved: 0,
      warningLevel: 50,
    },
  });

  console.log('✅ 库存创建成功');

  // 创建销售单
  const invoice = await prisma.salesInvoice.create({
    data: {
      companyId: company.id,
      invoiceNo: 'INV-2025-001',
      customerId: customer1.id,
      userId: user.id,
      invoiceDate: new Date(),
      totalAmount: 3000,
      discountAmount: 0,
      finalAmount: 3000,
      status: 'draft',
      paymentStatus: 'unpaid',
      notes: '测试销售单',
    },
  });

  console.log('✅ 销售单创建成功:', invoice.id);

  // 创建销售单明细
  await prisma.salesItem.create({
    data: {
      invoiceId: invoice.id,
      productId: product1.id,
      quantity: 2,
      unitPrice: 1000,
      discountRate: 0,
      lineAmount: 2000,
    },
  });

  await prisma.salesItem.create({
    data: {
      invoiceId: invoice.id,
      productId: product2.id,
      quantity: 0.5,
      unitPrice: 2000,
      discountRate: 0,
      lineAmount: 1000,
    },
  });

  console.log('✅ 销售单明细创建成功');

  console.log('✅ 数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

