import mongoose from "mongoose";

/**
 * One collection covers fruits, liquid bases, and add-ons.
 * `category` decides which step of the customer flow it shows up in,
 * and `animationType` decides how it's animated on the prep screen.
 *
 * category:      "fruit" | "liquid" | "addon"
 * animationType: "chunk" (fruit pieces dropping) | "powder" (protein/vitamin/zinc swirl)
 *                "sprinkle" (seeds/nuts falling) | "drizzle" (chocolate/oil/syrup)
 */
const IngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    price: { type: Number, required: true }, // in rupees
    category: {
      type: String,
      enum: ["fruit", "liquid", "addon"],
      required: true,
    },
    // quantity options shown as chips, e.g. [10,20,30] for grams or [50,100,150] for ml
    quantityOptions: { type: [Number], default: [] },
    unit: { type: String, enum: ["g", "ml", "unit"], default: "g" },
    animationType: {
      type: String,
      enum: ["chunk", "powder", "sprinkle", "drizzle"],
      default: "chunk",
    },
    colorHex: { type: String, default: "#e8632c" }, // used for the live glass preview + drop color
    icon: { type: String, default: "🍓" }, // emoji fallback; swap for real icon/image later
    nutrition: {
      protein: { type: Number, default: 0 },
      vitaminC: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      zinc: { type: Number, default: 0 },
    },
    inStock: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Ingredient ||
  mongoose.model("Ingredient", IngredientSchema);
