import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    products : [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                required: true
            },
            price:{
                type: Number,
                required: true
            },
            name: {
                type:String,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type:String,
        required: true
    },
    deliveryDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["Confirmed", "Delivered" ,"Out for Delivery", "Cancelled", "Pending", "Shipped"],
        default: 'Pending',
        required: 'true'
    },
    returnRequest: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason:string,
        status:{
            type:String,
            enum:['Pending','Approved','Declined']
        }
    }
     

  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order",orderSchema);

export default Order;
