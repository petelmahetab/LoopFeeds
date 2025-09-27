import express from 'express';
import { getFoodPartnerProfile } from '../controllers/auth.controller.js'; // or named import


const router = express.Router();


router.get('/profile', getFoodPartnerProfile); 

export default router;
