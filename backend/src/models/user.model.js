import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    mobileNumber: {
        type: Number,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true})


export const user = mongoose.model("user", userSchema)
