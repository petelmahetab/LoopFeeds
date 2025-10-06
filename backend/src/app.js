import express from 'express';
import { auth } from 'express-openid-connect';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();


const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  // authorizationParams: { response_type: 'code', scope: 'openid profile email' }
};
app.use(auth(authConfig));

// When using ESM, you must include .js extensions
import authController from './controllers/auth.controller.js';
import foodRoutes from './routes/food.routes.js';
import foodPartnerRoutes from './routes/food-partner.routes.js';
import authRoutes from './routes/auth.routes.js';



app.use(cors({ origin: 'http://localhost:5173', credentials: true }));



app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// call the authController setup
authController.setupUserAuth(app);

app.get('/logout', (req, res) => res.oidc.logout({ returnTo: '/' }));

app.get('/login', (req, res) => {
  console.log('Authenticated?', req.oidc.isAuthenticated());
  if (!req.oidc.isAuthenticated()) {
    
    return res.oidc.login({ returnTo: '/profile', authorizationParams: { response_type: 'code' } });
  }
  res.redirect('/profile');
});

authController.setupFoodPartnerRoutes?.(app);

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);

export default app;  
