import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, search?: string) {
    return this.prisma.product.findMany({
      where: { companyId, ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const product = await this.prisma.product.findFirst({ where: { id, companyId } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(companyId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { companyId, name: dto.name, price: dto.price, costPrice: dto.costPrice, stock: dto.stock ?? 0, imageUrl: dto.imageUrl, barcode: dto.barcode },
    });
  }

  async update(id: string, companyId: string, dto: UpdateProductDto) {
    await this.findOne(id, companyId);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted' };
  }
}
