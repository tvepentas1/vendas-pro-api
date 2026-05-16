import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @Min(0) price: number;
  @IsNumber() @IsOptional() @Min(0) costPrice?: number;
  @IsNumber() @IsOptional() @Min(0) stock?: number;
  @IsString() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() barcode?: string;
}
