import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { user } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';


const generateAccessAndRefreshToken = async (userID) => {
    try {
        const newUser = await user.findById(userID)
        const accessToken = newUser.generateAccessToken()
        const refreshToken = newUser.generateRefreshToken()

        newUser.refreshToken = refreshToken
        await newUser.save({validateBeforeSave: false})

        return { accessToken, refreshToken }

    } catch (error){
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = AsyncHandler(async (req, res) => {

    // checking if all fields have value in them or not
    const { fullName, email, mobileNumber, password } = req.body;
    if(
        [fullName, email, mobileNumber, password].some((field) => field.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // checking if user already exists with the same values
    const existingUser = await user.findOne({
        $or: [{fullName}, {email}, {mobileNumber}]
    })
    if(existingUser){
        throw new ApiError(402, "User already exists")
    }

    // creating a new user entry in the database
    const User = await user.create({
        fullName,
        mobileNumber,
        email,
        password
    })

    // removed password and refresh token field from the response
    const createdUser = await user.findById(User._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // check for user creation response
    return res
    .status(200)
    .json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = AsyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;
    if(!email || !password){
        throw new ApiError(400, "Both email and password are required")
    }

    const User = await user.findOne({
        $or: [{email}, {fullName}]
    })
    if(!User){
        throw new ApiError(404, "User does not exists")
    }


    const isPasswordValid = await User.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credential's")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(User._id)

    const loggedInUser = await user.findById(User._id).select("-password -refreshtoken")
    

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = AsyncHandler(async (req, res) => {
    await user.findByIdAndUpdate(
        req.newUser._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})

export{
    registerUser,
    loginUser,
    logoutUser
}
