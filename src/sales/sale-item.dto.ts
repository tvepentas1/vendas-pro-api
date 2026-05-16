import { IsNumber, IsUUID, Min } from 'class-validator';

export class SaleItemDto {
  @IsUUID() productId: string;
  @IsNumber() @Min(1) quantity: number;
}
