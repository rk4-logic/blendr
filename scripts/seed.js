// Run with: npm run seed
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const SettingsSchema = new mongoose.Schema({}, { strict: false });
const Ingredient = mongoose.model("Ingredient", IngredientSchema);
const Settings = mongoose.model("Settings", SettingsSchema);

const fruits = [
  { name: "Strawberry", tagline: "Sweet and tangy berry sparkle", price: 35, category: "fruit", quantityOptions: [10, 20, 30], unit: "g", animationType: "chunk", colorHex: "#e8425a", icon: "🍓" },
  { name: "Banana", tagline: "Creamy tropical richness", price: 25, category: "fruit", quantityOptions: [10, 20, 30], unit: "g", animationType: "chunk", colorHex: "#f1c94b", icon: "🍌" },
  { name: "Mango", tagline: "Sunny tropical flavor burst", price: 30, category: "fruit", quantityOptions: [10, 20, 30], unit: "g", animationType: "chunk", colorHex: "#ffa63d", icon: "🥭" },
  { name: "Blueberry", tagline: "Naturally bold and juicy", price: 40, category: "fruit", quantityOptions: [10, 20, 30], unit: "g", animationType: "chunk", colorHex: "#4a5aa8", icon: "🫐" },
];

const liquids = [
  { name: "Milk", tagline: "Classic creamy texture", price: 25, category: "liquid", quantityOptions: [50, 100, 150], unit: "ml", animationType: "drizzle", colorHex: "#f4f2ec", icon: "🥛" },
  { name: "Almond Milk", tagline: "Light nutty smoothness", price: 35, category: "liquid", quantityOptions: [50, 100, 150], unit: "ml", animationType: "drizzle", colorHex: "#e3cfa8", icon: "🌰" },
  { name: "Curd", tagline: "Cool and tangy blend", price: 30, category: "liquid", quantityOptions: [50, 100, 150], unit: "ml", animationType: "drizzle", colorHex: "#fbf8f0", icon: "🍦" },
  { name: "Water", tagline: "Clean and light finish", price: 10, category: "liquid", quantityOptions: [50, 100, 150], unit: "ml", animationType: "drizzle", colorHex: "#bcd9e8", icon: "💧" },
];

const addons = [
  { name: "Chocolate Sprinkles", tagline: "Sweet crunchy finish", price: 25, category: "addon", quantityOptions: [], unit: "unit", animationType: "sprinkle", colorHex: "#5a3826", icon: "🍫" },
  { name: "Whey Protein", tagline: "Energy boost and texture", price: 40, category: "addon", quantityOptions: [], unit: "unit", animationType: "powder", colorHex: "#e8e0cf", icon: "💪", nutrition: { protein: 20 } },
  { name: "Dry Fruits", tagline: "Healthy nutty crunch", price: 30, category: "addon", quantityOptions: [], unit: "unit", animationType: "sprinkle", colorHex: "#b5854a", icon: "🥜" },
  { name: "Chia Seeds", tagline: "Fiber-rich topping", price: 20, category: "addon", quantityOptions: [], unit: "unit", animationType: "sprinkle", colorHex: "#33302b", icon: "🌱", nutrition: { fiber: 8 } },
  { name: "Zinc Boost", tagline: "Immunity support powder", price: 20, category: "addon", quantityOptions: [], unit: "unit", animationType: "powder", colorHex: "#9fb8c9", icon: "✨", nutrition: { zinc: 5 } },
  { name: "Vitamin C Boost", tagline: "Extra immunity, citrus edge", price: 20, category: "addon", quantityOptions: [], unit: "unit", animationType: "powder", colorHex: "#ffcf4a", icon: "🍊", nutrition: { vitaminC: 60 } },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Ingredient.deleteMany({});
  await Ingredient.insertMany([...fruits, ...liquids, ...addons]);

  await Settings.deleteMany({});
  await Settings.create({
    thicknessRatio: 0.15,
    maxAddons: 3,
    cups: [
      { name: "Small", ml: 250, price: 0 },
      { name: "Medium", ml: 350, price: 15 },
      { name: "Large", ml: 500, price: 30 },
    ],
  });

  console.log("Seeded ingredients + settings ✅");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
