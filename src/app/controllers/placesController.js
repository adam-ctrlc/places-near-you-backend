import {
  searchPlaces,
  geocodeLocation,
  reverseGeocode,
  getPlaceById,
  getFeaturedPlaces,
  CATEGORIES,
} from "../services/placesService.js";

export async function search(req, res) {
  try {
    const { lat, lon, q, radius = 5000, page = 1, limit = 10 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required",
      });
    }

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query (q) is required",
      });
    }

    const result = await searchPlaces(
      parseFloat(lat),
      parseFloat(lon),
      q,
      parseInt(radius),
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result.places,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search places",
    });
  }
}

export async function getPlace(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Place ID is required",
      });
    }

    const place = await getPlaceById(id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: "Place not found",
      });
    }

    res.json({
      success: true,
      data: place,
    });
  } catch (error) {
    console.error("Get place error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get place details",
    });
  }
}

export async function geocode(req, res) {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: "Location query is required",
      });
    }

    const result = await geocodeLocation(location);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Geocode error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to geocode location",
    });
  }
}

export async function reverseGeocodeHandler(req, res) {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required",
      });
    }

    const result = await reverseGeocode(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reverse geocode",
    });
  }
}

export function getCategories(req, res) {
  res.json({
    success: true,
    data: CATEGORIES,
  });
}

export async function featured(req, res) {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required",
      });
    }

    const places = await getFeaturedPlaces(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.error("Featured places error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch featured places",
    });
  }
}
