// food.controller.js
import foodModel from '../models/food.model.js';
import storageService from '../services/storage.service.js';
import { generateEmbedding } from '../services/ai.service.js';
import likeModel from '../models/likes.model.js';
import saveModel from '../models/save.model.js';
import { v4 as uuid } from 'uuid';
import { uploadFile } from '../services/storage.service.js';

export async function createFood(req, res, next) {
  try {
    /* 1.  file upload */
    const file = req.file;               // given by multer
    if (!file) return res.status(400).json({ error: 'Image file required' });

    const fileUploadResult = await uploadFile(file.buffer, uuid());

    /* 2.  AI embedding */
    const embedding = await generateEmbedding(req.body.description);

    /* 3.  create record */
    const foodItem = await foodModel.create({
      name: req.body.name,
      description: req.body.description,
      video: fileUploadResult.url,
      foodPartner: req.foodPartner?._id ?? null,   // optional until you add auth
      niche: req.body.niche,
      embedding
    });

    res.status(201).json({ message: 'Food created', food: foodItem });
  } catch (e) {
    next(e);          // reaches global handler → JSON error
  }
}

export async function getFoodItems(req, res) {
  const foodItems = await foodModel.find({});
  res.status(200).json({
    message: "Food items fetched successfully",
    foodItems
  });
}

export async function likeFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  const isAlreadyLiked = await likeModel.findOne({ user: user._id, food: foodId });

  if (isAlreadyLiked) {
    await likeModel.deleteOne({ user: user._id, food: foodId });
    await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: -1 } });

    return res.status(200).json({ message: "Food unliked successfully" });
  }

  const like = await likeModel.create({ user: user._id, food: foodId });
  await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: 1 } });

  res.status(201).json({
    message: "Food liked successfully",
    like
  });
}

export async function saveFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  const isAlreadySaved = await saveModel.findOne({ user: user._id, food: foodId });

  if (isAlreadySaved) {
    await saveModel.deleteOne({ user: user._id, food: foodId });
    await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: -1 } });

    return res.status(200).json({ message: "Food unsaved successfully" });
  }

  const save = await saveModel.create({ user: user._id, food: foodId });
  await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: 1 } });

  res.status(201).json({
    message: "Food saved successfully",
    save
  });
}

export async function getSaveFood(req, res) {
  const user = req.user;

  const savedFoods = await saveModel.find({ user: user._id }).populate('food');

  if (!savedFoods || savedFoods.length === 0) {
    return res.status(404).json({ message: "No saved foods found" });
  }

  res.status(200).json({
    message: "Saved foods retrieved successfully",
    savedFoods
  });
}

export async function getVideosByNiches(req, res) {
    const { niches } = req.query; // ?niches=food,fashion
    const nichesArray = niches.split(',');
    const videos = await foodModel.find({ niche: { $in: nichesArray } }).sort({ createdAt: -1 });
    res.status(200).json({ message: "Videos fetched", videos });
  }
  
  export async function incrementView(req, res) {
    const { videoId } = req.params;
  
    const video = await foodModel.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );
  
    res.status(200).json({ message: "View counted", video });
  }
  
  export async function getVideoAnalytics(req, res) {
    const analytics = await foodModel.aggregate([
      {
        $group: {
          _id: "$niche",
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likeCount" },
          totalSaves: { $sum: "$savesCount" }
        }
      }
    ]);
  
    res.status(200).json({ message: "Analytics fetched", analytics });
  }

  export async function getTrendingVideos(req, res) {
    const videos = await FoodModel.find({});
  
    // Calculate hot score = likeCount / hours since posted
    const now = new Date();
    const videosWithScore = videos.map(video => {
      const hoursSincePosted = Math.max((now - video.createdAt) / (1000 * 60 * 60), 1);
      const hotScore = video.likeCount / hoursSincePosted;
      return { ...video.toObject(), hotScore };
    });
  
    // Sort by hot score descending
    videosWithScore.sort((a, b) => b.hotScore - a.hotScore);
  
    res.status(200).json({
      message: "Trending videos",
      videos: videosWithScore.slice(0, 20) // top 20
    });
  }
  
  function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  export async function getRecommendedVideos(req, res) {
    const { videoId } = req.params;
    const targetVideo = await FoodModel.findById(videoId);
    if (!targetVideo) return res.status(404).json({ message: "Video not found" });
  
    const allVideos = await FoodModel.find({ _id: { $ne: videoId } }); // exclude target
    const recommendations = allVideos.map(video => {
      return {
        video,
        similarity: cosineSimilarity(targetVideo.embedding, video.embedding)
      };
    });
  
    // Sort by similarity descending
    recommendations.sort((a, b) => b.similarity - a.similarity);
  
    res.status(200).json({
      message: "Recommended videos",
      videos: recommendations.slice(0, 10).map(r => r.video)
    });
  }