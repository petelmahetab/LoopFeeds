import express from 'express';  
import pkg from 'express-oauth2-jwt-bearer';
const { auth: checkJwt, requiredScopes } = pkg;
import userModel from '../models/user.model.js';
import foodPartnerModel from '../models/foodpartner.model.js';

import { auth as oidcAuth } from 'express-openid-connect';

import dotenv from 'dotenv';
dotenv.config();

// Config for web app auth (login/logout)
const oidcConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,  
  baseURL: process.env.AUTH0_BASE_URL, 
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,  // <-- The hero addition!
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  // Debug-friendly params (keep these)
  authorizationParams: {
    response_type: 'code',
    response_mode: 'query',  // URL-visible for now
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE
  }
};

const jwtCheck = checkJwt({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// Quick load check
// console.log('Env injected count:', process.env);  // Temp: Should show keys
console.log('Secret loaded?', !!process.env.AUTH0_SECRET ? 'Yes!' : 'Nope');
console.log('Client Secret loaded?', !!process.env.AUTH0_CLIENT_SECRET ? 'Locked in!' : 'Missing!');
// =====================
// USER AUTH (Web App Flow)
// =====================
export function setupUserAuth(app) {
  // login/logout/profile
  app.use(oidcAuth(oidcConfig));

  // Spy on callback (temp debug—remove later)
  app.use('/callback', (req, res, next) => {
    console.log('Callback query:', req.query);  // Expect code & state
    next();
  });

  app.get('/profile', (req, res) => {
    res.json({
      message: 'User profile unlocked!',
      loggedIn: req.oidc.isAuthenticated(),
      user: req.oidc.user
    });
  });

  app.get('/logout', (req, res) => {
    res.oidc.logout('/');
  });
}

export function setupFoodPartnerRoutes(app) {
  app.get('/api/food-partner/private',
    jwtCheck,
    requiredScopes('read:foods'),
    (req, res) => {
      res.json({ message: 'Food partner private data' });
    });
}

export const getFoodPartnerProfile = (req, res) => {
  res.json({
    loggedIn: req.oidc.isAuthenticated(),
    user: req.oidc.user || null
  });
};

export function logout(req, res) {
  req.oidc.logout('/');
}

export default {
  setupUserAuth,
  setupFoodPartnerRoutes,
  getFoodPartnerProfile,
  logout
};