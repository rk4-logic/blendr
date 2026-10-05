import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    cup: {
      name: String,
      ml: Number,
      price: Number,
    },
    fruits: [
      {
        name: String,
        grams: Number,
        price: Number,
      },
    ],
    liquid: {
      name: String,
      ml: Number,
      price: Number,
    },
    addons: [
      {
        name: String,
        price: Number,
      },
    ],
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentId: { type: String, default: null }, // Razorpay payment id once wired up
    status: {
      type: String,
      enum: ["received", "preparing", "ready", "completed"],
      default: "received",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
