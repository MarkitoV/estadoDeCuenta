import { Request, Response } from 'express';
import Movimiento from '../models/Movimiento';

export const createMovimiento = async (req: Request, res: Response) => {
  try {
    const nuevoMovimiento = new Movimiento(req.body);
    const movimientoGuardado = await nuevoMovimiento.save();
    res.status(201).json(movimientoGuardado);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el movimiento', error });
  }
};

export const getMovimientos = async (req: Request, res: Response) => {
  try {
    const movimientos = await Movimiento.find();
    res.status(200).json(movimientos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los movimientos', error });
  }
};

export const getMovimientoById = async (req: Request, res: Response) => {
  try {
    const movimiento = await Movimiento.findById(req.params.id);
    if (!movimiento) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    res.status(200).json(movimiento);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el movimiento', error });
  }
};

export const updateMovimiento = async (req: Request, res: Response) => {
  try {
    const movimientoActualizado = await Movimiento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!movimientoActualizado) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    res.status(200).json(movimientoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el movimiento', error });
  }
};

export const deleteMovimiento = async (req: Request, res: Response) => {
  try {
    const movimientoEliminado = await Movimiento.findByIdAndDelete(req.params.id);
    if (!movimientoEliminado) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    res.status(200).json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el movimiento', error });
  }
};
