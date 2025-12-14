export interface Movimiento {
  _id?: string;
  fecha: Date;
  descripcion: string;
  debito: number;
  credito: number;
  saldo?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
