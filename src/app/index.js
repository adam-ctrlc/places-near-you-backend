import express from "express";
import cors from "cors";
import { config } from "../config/index.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "LocalFinder API is running",
    version: "1.0.0",
    status: "ok",
  });
});

app.use("/api", routes);

export default app;
