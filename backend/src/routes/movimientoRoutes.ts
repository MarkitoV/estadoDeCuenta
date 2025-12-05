import { Router } from 'express';
import { createMovimiento, getMovimientos } from '../controllers/movimientoController';

const router = Router();

router.post('/', createMovimiento);
router.get('/', getMovimientos);

export default router;
