import express from 'express';
import { getFoodPartnerProfile } from '../controllers/auth.controller.js'; 


const router = express.Router();

router.get('/profile', (req, res) => {
    res.json({
      message: 'User profile unlocked!',
      loggedIn: req.oidc.isAuthenticated(),
      user: req.oidc.user
    });
  });
  
export default router;
