import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    // Log the id
    console.log("Chat ID from route:", id);

    // ...existing code...
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}