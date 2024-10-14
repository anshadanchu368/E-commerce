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

const loginUser = asyncHandler(async (req,res)=>{

    const {email, password, username} =req.body

    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({$or:[{username},{email}]})

    if(!user){
        throw new ApiError(404, "User doesnot exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken,
                refreshTOken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200, null, "User logged out successfully"))
})

