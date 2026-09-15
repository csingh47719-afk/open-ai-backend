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


/* ================= HOME ================= */

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Open AI Assistant backend"
  });
});


/* ================= TEXT CHAT ================= */

app.post("/chat", async (req, res) => {

  try {

    const message =
      String(req.body?.message || "").trim();

    if (!message) {

      return res.status(400).json({
        error: "message is required"
      });
    }


    const response =
      await client.responses.create({

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


/* ================= IMAGE + QUESTION ================= */

app.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          error: "No file uploaded"
        });
      }


      const question =
        String(req.body?.message || "").trim();


      const mimeType =
        req.file.mimetype;


      /* Check image */

      if (
        !mimeType.startsWith("image/")
      ) {

        return res.status(400).json({
          error: "Please upload an image"
        });
      }


      /* Convert image to base64 */

      const base64Image =
        req.file.buffer.toString("base64");


      const imageDataUrl =
        `data:${mimeType};base64,${base64Image}`;


      const userQuestion =
        question ||
        "Describe this image in detail.";


      /* Send image + question to OpenAI */

      const response =
        await client.responses.create({

          model: "gpt-5.6-luna",

          input: [
            {
              role: "user",

              content: [

                {
                  type: "input_text",
                  text: userQuestion
                },

                {
                  type: "input_image",
                  image_url: imageDataUrl,
                  detail: "auto"
                }

              ]
            }
          ]
        });


      res.json({

        ok: true,

        reply:
          response.output_text

      });


    } catch (error) {

      console.error(
        "IMAGE AI ERROR:",
        error
      );


      res.status(500).json({

        error:
          "Image AI request failed",

        details:
          error.message

      });
    }
  }
);


/* ================= SERVER ================= */

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);
