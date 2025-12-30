import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  overpassApiUrl:
    process.env.OVERPASS_API_URL || "https://overpass-api.de/api/interpreter",
  nominatimApiUrl:
    process.env.NOMINATIM_API_URL || "https://nominatim.openstreetmap.org",
};
