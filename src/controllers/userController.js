import User from "../models/userModel.js"
import {ApiError} from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, error.message || "something went wrong while generating refreshh and access token")
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

const refreshAccessToken = asyncHandler(async (req,res)=>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshAccessToken

    if(!incomingRefreshToken){
        throw new ApiError(400, "Unauthorized request")
    }

    try{

        const decodedToken =jwt.verify(
            incomingRefreshToken,
            process.env.USER_REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401,"invalid Refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure:true
        }
    
        const {accessToken, newRefreshToken} =await generateAccessAndRefereshTokens(user._id)
    
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToke,optionsn).json(
            new ApiResponse(200, {accessToken, refreshToken:newRefreshToken}, "Access token refreshed successfully")
        )
    }catch(error){
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

   
})


const changePassword =asyncHandler(async(req,res)=>{

    const {oldPassord, newPassword}= req.body 

    const user = await User.findById(req.user?.id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassord)


    
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword

    await user.save({validateBeforeSave:false})

    return res
     .status(200)
     .json(new ApiResponse(200 , {}, "Password changed succesfully"))
})


const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"User Fetched succesfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{

    const {username, email} = req.body;

    if(!username || !email){
        throw new APiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                username,
                email:email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
             


})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails
}