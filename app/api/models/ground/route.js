import { NextResponse } from "next/server";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

// INIT GEMINI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// SYSTEM PROMPT FOR GROUNDING
const SYSTEM_PROMPT = `
You are an image grounding model.

Your job:
Given a user query and an image, identify the location(s) of the target object(s)
and return ONLY the coordinates in a strict JSON format.

RULES:
- Return ONLY JSON.
- Format:
{
  "coordinates": [
    { "x": <number between 0 and 1>, "y": <number between 0 and 1> },
    { "x": <number between 0 and 1>, "y": <number between 0 and 1> },
    { "x": <number between 0 and 1>, "y": <number between 0 and 1> },
    { "x": <number between 0 and 1>, "y": <number between 0 and 1> }
  ]
}
- Coordinates = four corners of rectangle.
- No extra text, no explanations, no markdown.
- Coordinates must be normalized between 0 and 1.
- If nothing is found, return { "coordinates": [] }.
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
            { text: prompt || "Locate the requested object." },
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

    let text = result.response.text().trim();

    // Try JSON parsing
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Model returned invalid JSON:", text);
      return NextResponse.json(
        { error: "Model returned invalid grounding JSON", raw: text },
        { status: 500 }
      );
    }

    // Validate structure
    if (!parsed.coordinates || !Array.isArray(parsed.coordinates)) {
      return NextResponse.json(
        { error: "Invalid coordinate format", raw: parsed },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Grounding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
