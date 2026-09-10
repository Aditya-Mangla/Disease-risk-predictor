import jwt from 'jsonwebtoken';
import { user } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';


// Validating the token from the user with the secret present in the server and then checking if any user with same signature is present or not.
const verifyJWT = AsyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const User = await user.findById(decodedToken?._id).select("-password -refreshToken")
        if(!User){
            throw new ApiError(401, "Invalid token")
        }

        req.newUser = User;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
});

const optionalAuth = AsyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if(!token){
        throw new ApiError(401, "Unauthorized request")
    }

    if(token){
        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.newUser = await user.findById(decodedToken._id).select("-password")
        } catch (error) {
            // ignore invalid token for optional auth
        }
    }
    next()
});

const admin = AsyncHandler((req, res, next) => {
  if (req.newUser && req.newUser.role === 'admin') {
    next();
  } else {
    throw new ApiError(403, 'Not authorized as an admin');
  }
});


export {
    verifyJWT,
    optionalAuth,
    admin
}
