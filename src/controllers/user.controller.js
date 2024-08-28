// import { response } from "express"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "./../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken
   await user.save({validateBeforeSave: false});

    return {accessToken, refreshToken};

  } catch (error) {
    throw new ApiError(500, "Something went wrong. while generating refresh and access tokens");
  }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    //validation -not empty
    //check if user already exists : username, email
    // create user object - create entry in db
    // remove password and refresh token field from reponse
    //check for user creation
    //return response
    console.log("Received Data:", req.body);

    const {fullName, email, password, username} = req.body

    if (
    [fullName, email, password, username].some((field) =>
     field?.trim() === "" )
    ) {
        throw new ApiError(400, "All fields are required");
    }
   
  const normalizedUsername = username ? username.toLowerCase() : "";
  const normalizedEmail = email ? email.toLowerCase() : "";

   const existedUser = await User.findOne({
        $or: [{username : normalizedUsername}, {email : normalizedEmail}]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

 const user = await User.create({
        fullName,
        email: normalizedEmail,
        password,
        username: normalizedUsername
    })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong. Please try again later");
  }

  return res.status(201).json(
    new ApiResponse(200, "User created successfully", createdUser)
  )

  
})

const loginUser = asyncHandler(async (req, res) => {
  // req body data le ao
  // username or email access
  // find the user
  // check password
  // access and referesh token
  // send cookies

  const {email, username, password}= req.body;

  if ( !username && !email) {
    throw new ApiError(400, "email or password is required");
  }

  const user = await User.findOne({
        $or: [{username}, {email}]
      })
      
      if (!user) {
        throw new ApiError(404, "User does not exist");
      }

     const isPsswordValid = await user.isPasswordCorrect(password)

     if (!isPsswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

const {accessToken, refreshToken} =  await  generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
      httpOnly: true,
      secure: true,
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200,
        {
          user: loggedInUser, accessToken,
          refreshToken
         },
         "User logged in successfully"
         )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
 await User.findOneAndUpdate(
  req.user._id,
  {
    $set: {
      refreshToken: undefined,
    }
  },
  {
    new: true,
  }
 )
 const options = {
  httpOnly: true,
  secure: true,
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged out successfully"))

})



const refreshAccessToken = asyncHandler(async (req, res) => {
 const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

 if (incomingRefreshToken) {
  throw new ApiError(401, "unauthorized request"); 
 }

try {
   const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  
  )
  
  const user = await User.findById(decodedToken?._id)
  
  if (!user) { 
    throw new ApiError(401, "Invalid refresh token");
  }
  
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }
  
  const options = {
    httpOnly: true,
    secure: true,
  }
  const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", newRefreshToken, options)
  .json(
    new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully")
  )
  
  
} catch (error) {

  throw new ApiError(401, error?.message || "Invalid refresh token");
  
}
// const accessToken = user.generateAccessToken();
// return res.status(200).json(new ApiResponse(200, {accessToken}, "Access token refreshed successfully"));
 

})

export {registerUser, loginUser,logoutUser, refreshAccessToken }