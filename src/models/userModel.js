import mongoose from "mongoose"

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
},{
    timestamps:true
}

)