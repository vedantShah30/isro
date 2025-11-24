// Object Grounding API Route
// This endpoint localizes objects with oriented bounding boxes

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const query = formData.get('query');
    
    if (!image || !query) {
      return Response.json(
        { success: false, error: 'Image and query are required' },
        { status: 400 }
      );
    }
    
    // TODO: Replace with your actual grounding model API endpoint
    const GROUNDING_API_URL = process.env.GROUNDING_API_URL || 'https://your-model-api.com/ground';
    
    const imageBuffer = await image.arrayBuffer();
    
    const response = await fetch(GROUNDING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your API key if needed
        // 'Authorization': `Bearer ${process.env.MODEL_API_KEY}`
      },
      body: JSON.stringify({
        image: Buffer.from(imageBuffer).toString('base64'),
        query: query,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return Response.json({
      success: true,
      boundingBoxes: data.bounding_boxes || data.boxes || [],
      count: data.count,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Grounding API Error:', error);
    return Response.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
