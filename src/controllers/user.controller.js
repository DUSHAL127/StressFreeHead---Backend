// import { response } from "express"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "./../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    //validation -not empty
    //check if user already exists : username, email
    // create user object - create entry in db
    // remove password and refresh token field from reponse
    //check for user creation
    //return response


    const {fullName, email, password} = req.body

    if (
    [fullName, email, password].some((field) =>
     field?.trim() === "" )
    ) {
        throw new ApiError(400, "All fields are required");
    }
   

   const existedUser = User.create.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

 const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase()
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

export {registerUser};