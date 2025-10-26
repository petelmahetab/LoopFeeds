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
  // clientSecret: process.env.AUTH0_CLIENT_SECRET,  
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  // Debug-friendly params (keep these)
  authorizationParams: {
    response_type: 'code',
    response_mode: 'query',  // URL-visible for now
    scope: 'openid profile email',
    // audience: process.env.AUTH0_AUDIENCE
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
  

  app.get('/profile', async (req, res, next) => {
    if (!req.oidc.isAuthenticated()) return res.redirect('/login');
  
    try {
      const idToken = req.oidc.idToken;  // <-- Real prop: ID string
      if (!idToken) return res.status(503).json({ error: 'No id_token' });
  
      // Use pre-fetched user (faster than fetchUserInfo)
      const userinfo = req.oidc.user || await req.oidc.fetchUserInfo();  // Fallback
  
      // Upsert to Atlas (add auth0Id if missing in schema)
      const localUser = await userModel.findOneAndUpdate(
        { auth0Id: userinfo.sub },  // Link via sub
        { 
          auth0Id: userinfo.sub,  // Ensure set
          fullName: userinfo.name, 
          email: userinfo.email, 
          picture: userinfo.picture 
        },
        { upsert: true, new: true, runValidators: true }
      );
  
      res.json({ message: 'Profile', auth0: userinfo, local: localUser });
    } catch (e) {
      next(e);
    }
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