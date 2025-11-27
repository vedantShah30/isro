import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Chat from "@/models/Chat";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { imageUrl, routineId = null, responses = [], metadata = {} } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL missing" },
        { status: 400 }
      );
    }

    if (!Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { success: false, error: "Responses must be a non-empty array" },
        { status: 400 }
      );
    }

    const chat = await Chat.create({
      user: session.user.id,
      imageUrl,
      routine: routineId,
      responses,
      metadata,
    });

    return NextResponse.json({
      success: true,
      message: "Chat saved",
      chat,
    });
  } catch (error) {
    console.error("Chat Create Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
