import mongoose, { Schema, Document } from 'mongoose';

export interface IMovimiento extends Document {
  fecha: Date;
  descripcion: string;
  debito: number;
  credito: number;
  saldo: number;
}

const MovimientoSchema: Schema = new Schema({
  fecha: { type: Date, required: true },
  descripcion: { type: String, required: true },
  debito: { type: Number, default: 0 },
  credito: { type: Number, default: 0 },
  saldo: { type: Number, required: true },
});

export default mongoose.model<IMovimiento>('Movimiento', MovimientoSchema);
