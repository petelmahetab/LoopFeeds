// models/food.model.js
import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  foodPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "foodpartner",
  },
  niche: { type: String, required: true },
  likeCount: {
    type: Number,
    default: 0,
  },
  savesCount: {
    type: Number,
    default: 0,
  },
  views: { type: Number, default: 0 },
  embedding: { type: [Number], default: [] }
},{ timestamps: true });

const foodModel = mongoose.model("food", foodSchema);

export default foodModel;
