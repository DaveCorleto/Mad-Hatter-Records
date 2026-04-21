import express from "express";
import { Storage } from "@google-cloud/storage";

const app = express();
const storage = new Storage();

const BUCKET_NAME = process.env.GEAR_BUCKET || "madhatter-gear";
const GEAR_PREFIX = "gear/";

// CORS minimale
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  next();
});

function isImage(filename) {
  return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(filename);
}

function slugToTitle(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function prettifyCategory(category) {
  const map = {
    "guitars-basses": "Guitars & Basses",
    "amps": "Amps",
    "monitoring": "Monitoring",
    "recording": "Recording"
  };

  return map[category] || slugToTitle(category);
}

app.get("/api/gear", async (req, res) => {
  try {
    const [files] = await storage.bucket(BUCKET_NAME).getFiles({
      prefix: GEAR_PREFIX
    });

    const gear = files
      .filter(file => !file.name.endsWith("/"))
      .filter(file => isImage(file.name))
      .map(file => {
        const parts = file.name.split("/");

        if (parts.length < 3) return null;

        const category = parts[1];
        const filename = parts[parts.length - 1];
        const id = filename.replace(/\.[^/.]+$/, "").toLowerCase();
        const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${encodeURI(file.name)}`;

        return {
          id,
          name: slugToTitle(id),
          category,
          categoryLabel: prettifyCategory(category),
          imageUrl
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const categoryCompare = a.categoryLabel.localeCompare(b.categoryLabel);
        if (categoryCompare !== 0) return categoryCompare;
        return a.name.localeCompare(b.name);
      });

    res.json(gear);
  } catch (error) {
    console.error("Error reading gear from bucket:", error);
    res.status(500).json({
      error: "Unable to load gear"
    });
  }
});

const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});