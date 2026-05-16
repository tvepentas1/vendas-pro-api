import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto, @Request() req) {
    return this.salesService.create(req.user.companyId, req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.salesService.findAll(req.user.companyId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.salesService.findOne(id, req.user.companyId);
  }
}
