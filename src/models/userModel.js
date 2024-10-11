import mongoose from "mongoose"

const addressSchema = new mongoose.Schema({
    state:String,
    city:String,
    pincode:String,
    landmark:String,
    fullAddress:String,
    isDefault:{
        type:Boolean,
        default:false
    }
})

const wishlistItemSchema = new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    }
})

const walletHistorySchema = new mongoose.Schema({
    amount:{
        type:Number,
    },
    status:{
        type: String,
        enum:["Debit","Credit"]
    },
    time:{
        type:Date,
        default:Date.now
    }
})

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:false
    },
    password:{
        type:String,
        default:''
    },
    isAdmin:{
        type:boolean,
        default:false
    },
    otp:{
        type:String,
        default:null
    },
    otpExpiration: Date,
    blocked:{
        type:Boolean,
        default:false
    },
    cart:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            quantity:{
                type:Number,
                default:1
            },
            userStock:{
                type:Number,
                default:0,
                min:0
            }
        }
    ],
   addresses: [addressSchema],
   wishlist : [wishlistItemSchema],
   user_wallet : {
    type: Number,
    required :true,
    default:0
   },
   walletHistory : [walletHistorySchema]

},{
    timestamps:true
}

);

userSchema.methods.toJSON = function (){
    const user = this.toObject();
    delete user.otp;
    return user;
}

const User = mongoose.model("User", userSchema)

export default User