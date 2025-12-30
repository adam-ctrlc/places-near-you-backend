import { Router } from "express";
import placesRoutes from "./placesRoutes.js";

const router = Router();

router.use("/places", placesRoutes);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "LocalFinder API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
