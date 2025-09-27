import express from 'express';
import multer from 'multer';

import * as foodController from '../controllers/food.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
// import 

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

/* POST /api/food/ [protected] */
router.post(
  '/',
  authMiddleware.authFoodPartnerMiddleware,
  upload.single('mama'),
  foodController.createFood
);

/* GET /api/food/ [protected] */
router.get(
  '/',
  authMiddleware.authUserMiddleware,
  foodController.getFoodItems
);

/* POST /api/food/like [protected] */
router.post(
  '/like',
  authMiddleware.authUserMiddleware,
  foodController.likeFood
);

/* POST /api/food/save [protected] */
router.post(
  '/save',
  authMiddleware.authUserMiddleware,
  foodController.saveFood
);

/* GET /api/food/save [protected] */
router.get(
  '/save',
  authMiddleware.authUserMiddleware,
  foodController.getSaveFood
);


router.get('/videos',
authMiddleware.authUserMiddleware,
 foodController.getVideosByNiches
);

router.post('/videos/:videoId/view',
authMiddleware.authUserMiddleware, 
foodController.incrementView
);

 
router.get('/videos/trending',
authMiddleware.authUserMiddleware,  
foodController.getTrendingVideos
);


router.get('/videos/:videoId/recommendations',
authMiddleware.authUserMiddleware, 
foodController.getRecommendedVideos
);

export default router;
