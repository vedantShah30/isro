// Image Captioning API Route
// This endpoint generates comprehensive descriptions of satellite imagery

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image) {
      return Response.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // TODO: Replace with your actual captioning model API endpoint
    const CAPTIONING_API_URL = process.env.CAPTIONING_API_URL || 'https://your-model-api.com/caption';
    
    // Prepare the image for the model
    const imageBuffer = await image.arrayBuffer();
    
    // Call your deployed model
    const response = await fetch(CAPTIONING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your API key if needed
        // 'Authorization': `Bearer ${process.env.MODEL_API_KEY}`
      },
      body: JSON.stringify({
        image: Buffer.from(imageBuffer).toString('base64'),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return Response.json({
      success: true,
      caption: data.caption || data.result,
      confidence: data.confidence,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Captioning API Error:', error);
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
