import User from "../models/userModel.js"
import {ApiError} from "../utils/ApiError.js"


const generateAccessAndRefereshTokens = async(userId)=>{
     try{
          const user = await User.findById(userId)

          const accessToken = user.generateAccessToken()
          const refreshToken = user.generateRefreshToken()

          await user.save({validateBeforeSave:false})

          return {accessToken, refreshToken}


     }catch(error){
        throw new ApiError(500."something went wrong while generating refreshh and access token")
     }
}

const registerUser = asyncHandler( async (req,res)=>{

    const {username, email, password} = req.body

    if([username,email,password].some((field)=> field.trim() === "")){

        throw new ApiError(400, "All fields are required")

    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(400, "Username or email already exists")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await user.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(400, "Error creating user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User Registered succesfully")
    )

    

})