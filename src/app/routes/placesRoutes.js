import { Router } from "express";
import {
  search,
  getPlace,
  geocode,
  reverseGeocodeHandler,
  getCategories,
  featured,
} from "../controllers/placesController.js";

const router = Router();

router.get("/search", search);
router.get("/categories", getCategories);
router.get("/featured", featured);
router.get("/geocode", geocode);
router.get("/reverse-geocode", reverseGeocodeHandler);
router.get("/:id", getPlace);

export default router;
