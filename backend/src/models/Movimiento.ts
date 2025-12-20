import mongoose, { Schema, Document } from 'mongoose';

export interface IMovimiento extends Document {
  fecha: Date;
  descripcion: string;
  debito: number;
  credito: number;
  saldo: number;
  createdAt: Date;
  updatedAt: Date;
}

const MovimientoSchema: Schema = new Schema({
  fecha: { type: Date, required: true },
  descripcion: { type: String, required: true },
  debito: { type: Number, default: 0 },
  credito: { type: Number, default: 0 },
  saldo: { type: Number },
}, { timestamps: true });

MovimientoSchema.pre<IMovimiento>('save', async function () {
  if (this.isNew) {
    // Sort by date DESC and then by _id DESC to ensure we get the absolute latest created movement
    // even if multiple movements have the exact same timestamp.
    const ultimoMovimiento = await mongoose.model<IMovimiento>('Movimiento')
      .findOne()
      .sort({ fecha: -1, _id: -1 });

    const saldoAnterior = ultimoMovimiento ? ultimoMovimiento.saldo : 0;
    this.saldo = saldoAnterior + this.credito - this.debito;
  }
});

export default mongoose.model<IMovimiento>('Movimiento', MovimientoSchema);
