import express from "express";
import dotenv from "dotenv";
import connectDb from "./database/db.js";
import apiRoutes from "./routers/apiRoutes.js";
import customRoutes from "./routers/routers.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/v1", apiRoutes);
app.use("/api/v1", customRoutes); 

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDb();
}); 