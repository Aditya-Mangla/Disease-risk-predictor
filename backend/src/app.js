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
import mlPredictionRoutes from './routes/mlModel.routes.js';

// Routes declaration
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/prediction", mlPredictionRoutes)


export { app }
