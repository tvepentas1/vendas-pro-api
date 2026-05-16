import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(companyId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [todaySales, monthSales, topProductsRaw] = await Promise.all([
      this.prisma.sale.findMany({ where: { companyId, createdAt: { gte: todayStart } }, select: { total: true } }),
      this.prisma.sale.findMany({ where: { companyId, createdAt: { gte: monthStart } }, select: { total: true } }),
      this.prisma.saleItem.findMany({
        where: { sale: { companyId, createdAt: { gte: monthStart } } },
        select: { productId: true, quantity: true, product: { select: { name: true } } },
      }),
    ]);
    const todayTotal = todaySales.reduce((acc, s) => acc + s.total, 0);
    const monthTotal = monthSales.reduce((acc, s) => acc + s.total, 0);
    const productMap: Record<string, { productId: string; name: string; totalQuantity: number }> = {};
    for (const item of topProductsRaw) {
      if (!productMap[item.productId]) {
        productMap[item.productId] = { productId: item.productId, name: item.product.name, totalQuantity: 0 };
      }
      productMap[item.productId].totalQuantity += item.quantity;
    }
    const topProducts = Object.values(productMap).sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5);
    return { todayTotal, todayCount: todaySales.length, monthTotal, monthCount: monthSales.length, topProducts };
  }
}
