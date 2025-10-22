import express from 'express';
import multer from 'multer';

import * as foodController from '../controllers/food.controller.js';
// import * as authMiddleware from '../middlewares/auth.middleware.js';  // Removed

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

/* POST /api/food/ [now open] */
router.post(
  '/',
  upload.single('mama'),
  (err, req, res, next) => {              
    if (err) return res.status(400).json({ error: err.message });
    next(err);
  },
  foodController.createFood
);

/* GET /api/food/ [now open] */
router.get(
  '/',
  // authMiddleware.authUserMiddleware,  // <-- Remove this line
  foodController.getFoodItems
);

/* POST /api/food/like [now open] */
router.post(
  '/like',
  // authMiddleware.authUserMiddleware,  // <-- Remove this line
  foodController.likeFood
);

/* POST /api/food/save [now open] */
router.post(
  '/save',
  // authMiddleware.authUserMiddleware,  // <-- Remove this line
  foodController.saveFood
);

/* GET /api/food/save [now open] */
router.get(
  '/save',
  // authMiddleware.authUserMiddleware,  // <-- Remove this line
  foodController.getSaveFood
);

router.get('/videos',
  // authMiddleware.authUserMiddleware,  // <-- Remove this line
  foodController.getVideosByNiches
);

router.post('/videos/:videoId/view',
  // authMiddleware.authUserMiddleware,  // <-- Remove this line
  foodController.incrementView
);

router.get('/videos/trending',
  // authMiddleware.authUserMiddleware,  // <-- Remove this line
  foodController.getTrendingVideos
);

router.get('/videos/:videoId/recommendations',
  // authMiddleware.authUserMiddleware,  // <-- Remove this line
  foodController.getRecommendedVideos
);

export default router;