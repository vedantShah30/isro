import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDq46idjyKbHNxnq6f483dMu4MR2tFOUJQ');

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const query = formData.get('query');

    if (!image || !query) {
      return NextResponse.json(
        { error: 'Image and query are required' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Get the mime type
    const mimeType = image.type;

    // Initialize Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model:"gemini-2.5-flash" });

    // Prepare the prompt to get an initial generic response only
    const prompt = `You are an advanced satellite imagery analysis model. Analyze this image based on the query: "${query}"

Provide a brief initial processing message in 2-3 lines that indicates you are analyzing the image. Use language like:
- "Analyzing satellite imagery..."
- "Processing [relevant feature type] detection..."
- "Identifying [objects mentioned in query] in the provided region..."
- "Running geospatial analysis on the image..."

Be professional and technical. Sound like you're in the middle of processing, NOT giving final results. Mention what you're detecting/processing but don't give specific numbers or conclusions yet.`;

    // Create the image part
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    let errorMessage = error.message;
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid or missing Gemini API key';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded, please wait';
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
