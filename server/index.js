import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { fetchPublicProfile } from "./services/instagram.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend assets
app.use(express.static(path.join(__dirname, "..", "public")));

// API endpoint for public Instagram data
app.get("/api/profile/:username", async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    const data = await fetchPublicProfile(username.trim());
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Unable to fetch public data. Please try again later.",
      details: error.message,
    });
  }
});

// Fallback to frontend for any unknown route
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
