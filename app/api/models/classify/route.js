import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// SYSTEM PROMPT
const SYSTEM_PROMPT = `
You are a query-classification model.  
Your task is to classify the user's prompt into exactly ONE of the following three categories:

1. grounding – The user is asking to locate, point out, or find coordinates/regions of something inside the image.
2. vqa – The user is asking a question ABOUT the image that requires understanding but NOT giving coordinates.
3. captioning – The user is asking for a description or summary of the entire image.

RULES:
- Respond with ONLY ONE WORD: "grounding", "vqa", or "captioning".
- Do NOT provide explanations.
`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const response = await model.generateContent({
      systemInstruction: SYSTEM_PROMPT,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const classification = response.response.text().trim().toLowerCase();

    const allowed = ["grounding", "vqa", "captioning"];
    if (!allowed.includes(classification)) {
      return NextResponse.json(
        { error: "Model returned unexpected output", raw: classification },
        { status: 500 }
      );
    }

    return NextResponse.json({ type: classification });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
