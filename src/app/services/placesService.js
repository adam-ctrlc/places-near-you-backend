import { config } from "../../config/index.js";

async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      if (response.status === 429 || response.status >= 500) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
      }
      return response;
    } catch (error) {
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}

const CATEGORY_MAPPINGS = {
  restaurants: { amenity: "restaurant" },
  nightlife: { amenity: "bar" },
  bars: { amenity: "bar" },
  churches: { amenity: "place_of_worship", religion: "christian" },
  gyms: { leisure: "fitness_centre" },
  cafes: { amenity: "cafe" },
  parks: { leisure: "park" },
  hospitals: { amenity: "hospital" },
  pharmacies: { amenity: "pharmacy" },
  schools: { amenity: "school" },
  supermarkets: { shop: "supermarket" },
  banks: { amenity: "bank" },
  atms: { amenity: "atm" },
  gas_stations: { amenity: "fuel" },
  hotels: { tourism: "hotel" },
  museums: { tourism: "museum" },
  libraries: { amenity: "library" },
  post_offices: { amenity: "post_office" },
  police: { amenity: "police" },
  fire_stations: { amenity: "fire_station" },
};

export const CATEGORIES = [
  { id: "restaurants", name: "Restaurants", icon: "restaurant" },
  { id: "nightlife", name: "Nightlife", icon: "local_bar" },
  { id: "churches", name: "Churches", icon: "church" },
  { id: "gyms", name: "Gyms", icon: "fitness_center" },
  { id: "cafes", name: "Cafes", icon: "local_cafe" },
  { id: "parks", name: "Parks", icon: "park" },
  { id: "hospitals", name: "Hospitals", icon: "local_hospital" },
  { id: "pharmacies", name: "Pharmacies", icon: "local_pharmacy" },
  { id: "supermarkets", name: "Supermarkets", icon: "local_grocery_store" },
  { id: "banks", name: "Banks", icon: "account_balance" },
  { id: "hotels", name: "Hotels", icon: "hotel" },
  { id: "museums", name: "Museums", icon: "museum" },
];

function buildOverpassQuery(lat, lon, radiusMeters, category) {
  const categoryFilter = CATEGORY_MAPPINGS[category.toLowerCase()];

  if (!categoryFilter) {
    const searchTerm = category.toLowerCase();
    return `
      [out:json][timeout:25];
      (
        node["name"~"${searchTerm}",i](around:${radiusMeters},${lat},${lon});
        way["name"~"${searchTerm}",i](around:${radiusMeters},${lat},${lon});
      );
      out center body;
    `;
  }

  const filters = Object.entries(categoryFilter)
    .map(([key, value]) => `["${key}"="${value}"]`)
    .join("");

  return `
    [out:json][timeout:25];
    (
      node${filters}(around:${radiusMeters},${lat},${lon});
      way${filters}(around:${radiusMeters},${lat},${lon});
    );
    out center body;
  `;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getPlaceImage(tags) {
  // Return the actual image URL from OSM tags if available
  return tags?.image || tags?.["image:url"] || null;
}

function getPlacePhotos(tags) {
  // Return actual photos from OSM tags if available
  const photo = tags?.image || tags?.["image:url"];
  return photo ? [photo] : null;
}

function parseOpeningHours(openingHoursString) {
  if (!openingHoursString) return null;

  const lines = openingHoursString.split(";").map((s) => s.trim());
  return lines.map((line, index) => {
    const parts = line.split(" ");
    const days = parts[0] || "Unknown";
    const hours = parts.slice(1).join(" ") || "Hours vary";
    return {
      days,
      hours,
      highlight: index === 0,
    };
  });
}

function getOpenStatus(openingHoursString) {
  if (!openingHoursString) {
    const statuses = ["open", "open", "open", "closing-soon", "closed"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
  return "open";
}

function getPriceLevel(tags) {
  if (tags?.fee === "no" || tags?.access === "yes") return "Free";
  if (tags?.["price:range"]) return tags["price:range"];
  const levels = ["$", "$$", "$$$"];
  return levels[Math.floor(Math.random() * levels.length)];
}

function getAmenities(tags) {
  const amenities = [];

  if (tags?.internet_access === "wlan" || tags?.internet_access === "yes") {
    amenities.push({ icon: "wifi", label: "Free Wi-Fi" });
  }
  if (tags?.wheelchair === "yes") {
    amenities.push({ icon: "accessible", label: "Wheelchair Accessible" });
  }
  if (
    tags?.["payment:credit_cards"] === "yes" ||
    tags?.["payment:visa"] === "yes"
  ) {
    amenities.push({ icon: "credit_card", label: "Cards Accepted" });
  }
  if (tags?.parking) {
    amenities.push({ icon: "local_parking", label: "Parking Available" });
  }
  if (tags?.outdoor_seating === "yes") {
    amenities.push({ icon: "deck", label: "Outdoor Seating" });
  }
  if (tags?.takeaway === "yes") {
    amenities.push({ icon: "takeout_dining", label: "Takeaway" });
  }
  if (tags?.delivery === "yes") {
    amenities.push({ icon: "delivery_dining", label: "Delivery" });
  }

  return amenities.length > 0
    ? amenities
    : [{ icon: "info", label: "Contact for details" }];
}

function getRating(tags) {
  // Only return rating if it exists in OSM tags
  if (tags?.stars) {
    return parseFloat(tags.stars);
  }
  return null;
}

function getReviewCount(tags) {
  // Only return review count if available in tags
  return tags?.review_count ? parseInt(tags.review_count) : null;
}

export async function searchPlaces(
  lat,
  lon,
  category,
  radiusMeters = 5000,
  page = 1,
  limit = 10
) {
  const query = buildOverpassQuery(lat, lon, radiusMeters, category);

  const response = await fetchWithRetry(config.overpassApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response || !response.ok) {
    throw new Error("Failed to fetch places from Overpass API");
  }

  const data = await response.json();

  const allPlaces = data.elements
    .map((element, index) => {
      const placeLat = element.lat || element.center?.lat;
      const placeLon = element.lon || element.center?.lon;
      const distance = calculateDistance(lat, lon, placeLat, placeLon);
      const tags = element.tags || {};

      return {
        id: element.id,
        name: tags.name || "Unnamed Place",
        lat: placeLat,
        lon: placeLon,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        address:
          tags["addr:street"] && tags["addr:housenumber"]
            ? `${tags["addr:housenumber"]} ${tags["addr:street"]}`
            : tags["addr:full"] || "Address not available",
        distance: `${distance.toFixed(1)} mi`,
        distanceValue: distance,
        rating: getRating(tags),
        reviewCount: getReviewCount(tags),
        priceLevel: getPriceLevel(tags),
        status: getOpenStatus(tags.opening_hours),
        image: getPlaceImage(tags),
        phone: tags.phone || tags["contact:phone"] || null,
        website: tags.website || tags["contact:website"] || null,
        openingHours: tags.opening_hours || null,
        description: tags.description || null,
      };
    })
    .sort((a, b) => a.distanceValue - b.distanceValue);

  const totalCount = allPlaces.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPlaces = allPlaces.slice(startIndex, endIndex);

  return {
    places: paginatedPlaces,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function geocodeLocation(locationName) {
  const response = await fetch(
    `${config.nominatimApiUrl}/search?format=json&q=${encodeURIComponent(
      locationName
    )}&limit=1`,
    {
      headers: {
        "User-Agent": "LocalFinder/1.0",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Geocoding failed");
  }

  const data = await response.json();
  if (data.length === 0) {
    throw new Error("Location not found");
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

export async function reverseGeocode(lat, lon) {
  const response = await fetch(
    `${config.nominatimApiUrl}/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        "User-Agent": "LocalFinder/1.0",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const data = await response.json();
  return {
    city:
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      "Unknown",
    state: data.address?.state || "",
    country: data.address?.country || "",
    displayName: data.display_name,
  };
}

export async function getPlaceById(id) {
  const query = `
    [out:json][timeout:25];
    (
      node(${id});
      way(${id});
    );
    out center body;
  `;

  const response = await fetchWithRetry(config.overpassApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response || !response.ok) {
    throw new Error("Failed to fetch place details");
  }

  const data = await response.json();

  if (data.elements.length === 0) {
    return null;
  }

  const element = data.elements[0];
  const placeLat = element.lat || element.center?.lat;
  const placeLon = element.lon || element.center?.lon;
  const tags = element.tags || {};
  const categoryType =
    tags.amenity || tags.leisure || tags.tourism || tags.shop || "place";

  const rating = getRating(tags);
  return {
    id: element.id,
    name: tags.name || "Unnamed Place",
    lat: placeLat,
    lon: placeLon,
    category:
      categoryType.charAt(0).toUpperCase() +
      categoryType.slice(1).replace(/_/g, " "),
    address:
      tags["addr:street"] && tags["addr:housenumber"]
        ? `${tags["addr:housenumber"]} ${tags["addr:street"]}${
            tags["addr:city"] ? `, ${tags["addr:city"]}` : ""
          }`
        : tags["addr:full"] || null,
    rating,
    reviewCount: getReviewCount(tags),
    priceLevel: getPriceLevel(tags),
    status: getOpenStatus(tags.opening_hours),
    image: getPlaceImage(tags),
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    email: tags.email || tags["contact:email"] || null,
    openingHours: tags.opening_hours || null,
    description: tags.description || tags.note || null,
    amenities: getAmenities(tags),
    hours: parseOpeningHours(tags.opening_hours),
    photos: getPlacePhotos(tags),
    cuisine: tags.cuisine || null,
    brand: tags.brand || null,
    operator: tags.operator || null,
  };
}

export async function getFeaturedPlaces(lat, lon) {
  const categories = ["restaurants", "cafes", "bars", "parks"];
  const allPlaces = [];

  for (const category of categories) {
    try {
      const result = await searchPlaces(lat, lon, category, 3000);
      if (result.places && result.places.length > 0) {
        const topPlace = result.places[0];
        allPlaces.push({
          ...topPlace,
          category: category.charAt(0).toUpperCase() + category.slice(1),
        });
      }
    } catch {
      continue;
    }
  }

  return allPlaces.slice(0, 4);
}
