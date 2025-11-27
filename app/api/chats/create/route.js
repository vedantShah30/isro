import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Chat from "@/models/Chat";

export async function POST(req) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const body = await req.json();
    const { imageUrl, prompt, category, routineId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Mock model response
    const modelResponse = {
      output: `Mock ${category} response for "${prompt}"`,
      category,
    };

    const newChat = await Chat.create({
      user: body.userId || null,
      imageUrl,
      routine: routineId || null,
      isFirst: false,
      responses: [
        {
          type: category.toLowerCase(),
          prompt,
          response: modelResponse,
        },
      ],
      metadata: body.metadata || {},
    });

    return NextResponse.json({
      success: true,
      response: modelResponse,
      chat: newChat,
    });
  } catch (error) {
    console.error("Chat Create API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
