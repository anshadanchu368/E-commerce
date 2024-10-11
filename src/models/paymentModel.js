import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    payment_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      requuired: true,
    },
    payment_method: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default  Payment;