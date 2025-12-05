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
