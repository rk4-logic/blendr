import { connectDB } from "@/lib/mongodb";
import Ingredient from "@/models/Ingredient";

// PUT /api/ingredients/:id -> edit price, stock, name, etc.
export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();
  const updated = await Ingredient.findByIdAndUpdate(params.id, body, {
    new: true,
  });
  return Response.json(updated);
}

// DELETE /api/ingredients/:id
export async function DELETE(req, { params }) {
  await connectDB();
  await Ingredient.findByIdAndDelete(params.id);
  return Response.json({ ok: true });
}
