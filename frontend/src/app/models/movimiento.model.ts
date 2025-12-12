export interface Movimiento {
  _id?: string;
  fecha: Date;
  descripcion: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  saldo?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
