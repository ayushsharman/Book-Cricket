import express, {Router} from 'express';
import {auth} from  '../auth/authController.js';
import matchRoutes from '../match/matchRoutes.js';

const router = Router();

router.post('/auth', auth)
router.use('/matches', matchRoutes);

export default router;