// app.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); 



// When using ESM, you must include .js extensions
import authController from './controllers/auth.controller.js';
import foodRoutes from './routes/food.routes.js';
import foodPartnerRoutes from './routes/food-partner.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// call the authController setup
authController.setupUserAuth(app);
app.get('/login', (req, res) => res.oidc.login());
app.get('/logout', (req, res) => res.oidc.logout({ returnTo: '/' }));

app.get('/profile', (req, res) => {
  res.json({
    loggedIn: req.oidc.isAuthenticated(),
    user: req.oidc.user || null
    
  });
});
 

authController.setupFoodPartnerRoutes?.(app);

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);

export default app;  // instead of module.exports
