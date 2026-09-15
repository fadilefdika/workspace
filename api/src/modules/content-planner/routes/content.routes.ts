import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';

const router = Router();
const controller = new ContentController();

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
