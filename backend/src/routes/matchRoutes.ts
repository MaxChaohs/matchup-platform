import { Router } from 'express';
import {
  createMatch,
  getMatches,
  getMatchById,
  getUserMatches,
} from '../controllers/matchController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createMatch);
router.get('/', getMatches);
router.get('/:id', getMatchById);
router.get('/user/matches', authenticate, getUserMatches);

export default router;

