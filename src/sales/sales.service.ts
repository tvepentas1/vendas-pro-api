import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateSaleDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds }, companyId } });
    if (products.length !== productIds.length) throw new NotFoundException('One or more products not found');
    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new NotFoundException('Product not found');
      if (product.stock < item.quantity) throw new BadRequestException('Insufficient stock for: ' + product.name);
    }
    const saleItemsData = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return { productId: item.productId, quantity: item.quantity, unitPrice: product.price, subtotal: product.price * item.quantity };
    });
    const rawTotal = saleItemsData.reduce((acc, i) => acc + i.subtotal, 0);
    const discount = dto.discount ?? 0;
    const total = rawTotal - discount;
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: { companyId, userId, total, discount, paymentMethod: dto.paymentMethod, items: { create: saleItemsData } },
        include: { items: true },
      });
      for (const item of dto.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      }
      return sale;
    });
  }

  async findAll(companyId: string, startDate?: string, endDate?: string) {
    const where: any = { companyId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    return this.prisma.sale.findMany({
      where,
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, companyId },
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true } } },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }
}
