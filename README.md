# LocalFinder Backend API

A RESTful API backend for LocalFinder - a location-based place discovery application powered by OpenStreetMap data.

## 🚀 Features

- **Places Search** - Search for places by category near a location
- **Place Details** - Get detailed information about a specific place
- **Categories** - Browse available place categories
- **Featured Places** - Get trending/featured places near you
- **Geocoding** - Reverse geocode coordinates to location names

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Data Source**: OpenStreetMap (Overpass API)
- **Deployment**: Vercel (Serverless)

## 📁 Project Structure

```
backend/
├── api/
│   └── index.js          # Vercel serverless entry point
├── src/
│   ├── app/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic (placesService)
│   │   └── index.js      # Express app configuration
│   ├── config/           # Configuration files
│   └── index.js          # Development server entry
├── vercel.json           # Vercel deployment config
└── package.json
```

## 🔧 Installation

```bash
# Install dependencies
pnpm install

# Create .env file
cp .env.example .env
```

## 🏃 Running Locally

```bash
# Development mode (with hot reload)
pnpm dev

# Production mode
pnpm start
```

The API will be available at `http://localhost:3001`

## 📡 API Endpoints

### Places

| Method | Endpoint               | Description               |
| ------ | ---------------------- | ------------------------- |
| GET    | `/api/places/search`   | Search places by category |
| GET    | `/api/places/:id`      | Get place details by ID   |
| GET    | `/api/places/featured` | Get featured places       |

### Categories

| Method | Endpoint          | Description                  |
| ------ | ----------------- | ---------------------------- |
| GET    | `/api/categories` | Get all available categories |

### Query Parameters (Search)

| Parameter | Type   | Description                             |
| --------- | ------ | --------------------------------------- |
| `lat`     | number | Latitude coordinate                     |
| `lon`     | number | Longitude coordinate                    |
| `q`       | string | Category/search query                   |
| `radius`  | number | Search radius in meters (default: 5000) |
| `page`    | number | Page number for pagination              |
| `limit`   | number | Results per page (default: 10)          |

## 🌐 Deployment

This backend is configured for Vercel deployment:

```bash
# Deploy to Vercel
vercel --prod
```

## 📝 Environment Variables

| Variable      | Description         | Default     |
| ------------- | ------------------- | ----------- |
| `PORT`        | Server port         | 3001        |
| `NODE_ENV`    | Environment         | development |
| `CORS_ORIGIN` | Allowed CORS origin | \*          |

## 📄 License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## 👤 Author

**adam-ctrlc**

- GitHub: [@adam-ctrlc](https://github.com/adam-ctrlc)
