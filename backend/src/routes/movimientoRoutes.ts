import { Router } from 'express';
import { createMovimiento, getMovimientos, getMovimientoById, updateMovimiento, deleteMovimiento } from '../controllers/movimientoController';

const router = Router();

router.post('/', createMovimiento);
router.get('/', getMovimientos);
router.get('/:id', getMovimientoById);
router.put('/:id', updateMovimiento);
router.delete('/:id', deleteMovimiento);

export default router;
