import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

function generateOrderId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `BLD-${rand}`;
}

// POST /api/orders -> called after the review step, before/with payment
export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const order = await Order.create({
    ...body,
    orderId: generateOrderId(),
  });

  // TODO: once Razorpay is wired up, create the Razorpay order here and
  // return its id + key to the client to open the checkout widget.
  return Response.json(order, { status: 201 });
}

// GET /api/orders -> admin: list recent orders
export async function GET() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
  return Response.json(orders);
}
