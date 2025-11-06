import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import sequelize from "./config/db";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import { checkApiKey } from "./middlewares/apikeyValidationMiddleware";
import { authorize } from "./middlewares/authMiddleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const corsOptions ={
  origin:'*', 
  credentials:true, //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

// Middleware
app.use(cors(corsOptions))
app.use(checkApiKey);

app.use(bodyParser.json({limit: '10mb'}));

// Routes

// TODO: to add middleware to verify user type.
// currently relying on the user "role" param.
app.use("/api/auth", authRoutes);

// adding jwt validation after initial auth calls.
app.use("/api/books", authorize,  bookRoutes);
app.use("/api/reviews", authorize, reviewRoutes);

// Sync database and start server
sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to sync database:", err);
  });
