import User from "../models/userModel.js"

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