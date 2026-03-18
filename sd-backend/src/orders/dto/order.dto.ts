import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export enum OrderStatus {
  ABIERTA = 'ABIERTA',
  INVITADO = 'INVITADO',
  ASIGNADA = 'ASIGNADA',
  EN_CAMINO = 'EN_CAMINO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA'
}


export class CreateOrderDto {
  @IsString()
  descripcion: string;

  @IsString()
  puntoRetiro: string;

  @IsString()
  puntoEntrega: string;

  @IsNumber()
  @Min(0)
  montoOfertado: number;

  @IsNumber()
  @IsOptional()
  repartidorId?: number;
}


export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
