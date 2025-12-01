import { NextResponse } from "next/server";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

// INIT GEMINI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// SYSTEM PROMPT FOR VQA
const SYSTEM_PROMPT = `
You are an image VQA (Visual Question Answering) model.

Your task:
- Look at the image and answer the user's question.
- Your answer MUST be exactly ONE WORD.
- No sentences, no punctuation, no explanation.

If the answer is not known, respond with: "unknown".
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

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt (question) is required" },
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
            { text: prompt },
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

    let answer = result.response.text().trim();

    // enforce one-word output
    answer = answer.split(/\s+/)[0].toLowerCase();

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("VQA error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
