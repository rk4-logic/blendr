import { connectDB } from "@/lib/mongodb";
import Ingredient from "@/models/Ingredient";

// GET /api/ingredients?category=fruit  -> used by both customer page and admin panel
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const includeOutOfStock = searchParams.get("all") === "true"; // admin passes ?all=true

  const filter = {};
  if (category) filter.category = category;
  if (!includeOutOfStock) filter.inStock = true;

  const items = await Ingredient.find(filter).sort({ sortOrder: 1, createdAt: 1 });
  return Response.json(items);
}

// POST /api/ingredients  -> admin adds a new fruit / liquid / add-on
export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const created = await Ingredient.create(body);
  return Response.json(created, { status: 201 });
}
