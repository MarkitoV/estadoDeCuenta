import mongoose, { Schema, Document } from 'mongoose';

export interface IMetaMensual extends Document {
  mes: Date;
  saldoMinimo: number;
  saldoMes: number;
  nAbonos: number;
}

const MetaMensualSchema: Schema = new Schema({
  mes: { type: Date, required: true },
  saldoMinimo: { type: Number, required: true },
  saldoMes: { type: Number, required: true },
  nAbonos: { type: Number, required: true },
});

export default mongoose.model<IMetaMensual>('MetaMensual', MetaMensualSchema);
