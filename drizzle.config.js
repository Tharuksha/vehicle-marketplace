import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./configs/schema.js",
  dbCredentials: {
    url: 'postgresql://car-marketplace_owner:npg_nxiyq96XAJmG@ep-holy-water-a1lvjwoh-pooler.ap-southeast-1.aws.neon.tech/car-marketplace?sslmode=require',
  },
});
