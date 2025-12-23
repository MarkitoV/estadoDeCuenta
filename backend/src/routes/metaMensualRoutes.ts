import { Router } from 'express';
import { getMetas, createMeta, updateMeta, deleteMeta } from '../controllers/metaMensualController';

const router = Router();

router.get('/', getMetas);
router.post('/', createMeta);
router.put('/:id', updateMeta);
router.delete('/:id', deleteMeta);

export default router;
