import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "15kb"}))
app.use(express.urlencoded({extended: true, limit: "15kb"}))
app.use(cookieParser())


// Importing routes
import userRoutes from './routes/user.routes.js';
import predictionRoutes from './routes/prediction.routes.js';
import mlPredictionRoutes from './routes/mlModel.routes.js';

// Routes declaration
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/prediction", predictionRoutes)
app.use("/api/v1/prediction", mlPredictionRoutes)

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    const statusCode = error.code === 11000
        ? 409
        : error.name === "ValidationError"
            ? 400
            : error.statusCode || error.status || 500

    if (statusCode >= 500) {
        console.error(error)
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message: statusCode >= 500 ? "Internal server error" : error.message
    })
})


export { app }
