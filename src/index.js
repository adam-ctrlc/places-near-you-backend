import app from "./app/index.js";
import { config } from "./config/index.js";

if (config.nodeEnv !== "production") {
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

export default app;
