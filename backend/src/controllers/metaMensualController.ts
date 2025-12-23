import { Request, Response } from 'express';
import MetaMensual from '../models/MetaMensual';

export const getMetas = async (req: Request, res: Response) => {
  try {
    const metas = await MetaMensual.find().sort({ mes: 1 });
    res.json(metas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las metas', error });
  }
};

export const createMeta = async (req: Request, res: Response) => {
  try {
    const newMeta = new MetaMensual(req.body);
    const savedMeta = await newMeta.save();
    res.status(201).json(savedMeta);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la meta', error });
  }
};

export const updateMeta = async (req: Request, res: Response) => {
  try {
    const updatedMeta = await MetaMensual.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMeta) return res.status(404).json({ message: 'Meta no encontrada' });
    res.json(updatedMeta);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la meta', error });
  }
};

export const deleteMeta = async (req: Request, res: Response) => {
  try {
    const deletedMeta = await MetaMensual.findByIdAndDelete(req.params.id);
    if (!deletedMeta) return res.status(404).json({ message: 'Meta no encontrada' });
    res.json({ message: 'Meta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la meta', error });
  }
};
