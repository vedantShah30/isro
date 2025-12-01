import { NextResponse } from "next/server";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

// INIT GEMINI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// SYSTEM PROMPT
const SYSTEM_PROMPT = `
You are an image captioning model.
Summarize the image concisely and clearly.
Do NOT include bounding boxes, coordinates, or visual reasoning steps.
Give only a clean natural-language description.
`;

async function fetchImageAsBase64(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const mimeType = response.headers["content-type"] || "image/jpeg";
  const base64 = Buffer.from(response.data).toString("base64");
  return { base64, mimeType };
}

export async function POST(req) {
  try {
    const { imageUrl, prompt } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const { base64, mimeType } = await fetchImageAsBase64(imageUrl);

    const result = await model.generateContent({
      systemInstruction: SYSTEM_PROMPT,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt || "Describe this image." },
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
    });

    const caption = result.response.text().trim();

    if (!caption) {
      return NextResponse.json(
        { error: "Failed to generate caption" },
        { status: 500 }
      );
    }

    return NextResponse.json({ caption });
  } catch (error) {
    console.error("Captioning error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
