import mongoose from "mongoose";

/**
 * Singleton settings document the owner controls from /admin.
 * thicknessRatio: minimum grams of fruit required per ml of cup volume.
 *   requiredGrams = cup.ml * thicknessRatio
 * Tune this up if smoothies come out watery, down if fruit is going to waste.
 */
const CupSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "Small"
  ml: { type: Number, required: true }, // 250
  price: { type: Number, default: 0 }, // upcharge for bigger cup
});

const SettingsSchema = new mongoose.Schema({
  thicknessRatio: { type: Number, default: 0.15 }, // g per ml
  maxAddons: { type: Number, default: 3 },
  cups: { type: [CupSchema], default: [] },
});

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);
