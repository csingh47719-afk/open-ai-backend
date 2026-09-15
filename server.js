const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const multer = require("multer");

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Open AI Assistant backend"
  });
});

/* ================= CHAT ================= */

app.post("/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "message is required"
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: message
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI request failed"
    });
  }
});

/* ================= FILE UPLOAD ================= */

app.post("/upload", upload.single("file"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded"
      });
    }

    console.log("File received:", req.file.originalname);
    console.log("File type:", req.file.mimetype);
    console.log("File size:", req.file.size);

    res.json({
      ok: true,
      message: "File uploaded successfully",
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "File upload failed"
    });

  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
