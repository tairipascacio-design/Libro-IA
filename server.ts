import express from "express";
import path from "path";
import dotenv from "dotenv";
import {
  handleOrganizeDictation,
  handleRefineChapter,
  handleContinuationPrompts,
  handleDownloadAndroidScript,
} from "./server/apiRouter";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "25mb" }));

// API endpoints
app.post("/api/organize-dictation", handleOrganizeDictation);
app.post("/api/refine-chapter", handleRefineChapter);
app.post("/api/continuation-prompts", handleContinuationPrompts);
app.get("/api/download-android-script", handleDownloadAndroidScript);

// Serve static frontend in production
const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
