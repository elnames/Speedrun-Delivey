import { IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateTarifaDto {
  @IsString()
  zona: string;

  @IsNumber()
  @Min(0)
  precioBase: number;
}

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  puntos: number;

  @IsString()
  comentario?: string;

  @IsNumber()
  orderId: number;

  @IsNumber()
  sujetoId: number;
}
