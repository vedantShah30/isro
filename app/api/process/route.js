// Main Processing API - Routes to appropriate model based on query type
// Returns dummy responses for testing

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const query = formData.get('query');
    const queryType = formData.get('queryType');

    if (!image || !query || !queryType) {
      return Response.json(
        { success: false, error: 'Image, query, and queryType are required' },
        { status: 400 }
      );
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const startTime = Date.now();

    // DUMMY RESPONSES based on query type
    let result = {
      success: true,
      queryType: queryType,
      responseTime: '1.5s',
      timestamp: new Date().toISOString(),
    };

    if (queryType === 'captioning') {
      // Dummy captioning response
      result.caption = "This satellite image shows an urban area with mixed land use. The image contains multiple residential buildings with distinct rooftops, surrounded by vegetation including trees and shrubs. Several roads intersect the area, with visible vehicle traffic. In the northern section, there appears to be a commercial district with larger structures. The image was likely captured during daytime under clear weather conditions, as evidenced by the sharp shadows and high contrast. The resolution suggests this is approximately 0.5-1m per pixel imagery.";
      result.confidence = 0.89;
      result.metrics = {
        bleuScore: '0.76',
        iou: '--',
        accuracy: '89%'
      };
    } 
    else if (queryType === 'grounding') {
      // Dummy grounding response with bounding boxes
      const objectCount = Math.floor(Math.random() * 8) + 3;
      result.boundingBoxes = Array.from({ length: objectCount }, (_, i) => {
        const x1 = Math.floor(Math.random() * 1200);
        const y1 = Math.floor(Math.random() * 1200);
        const width = Math.floor(Math.random() * 200) + 100;
        const height = Math.floor(Math.random() * 200) + 100;
        
        return {
          x1: x1,
          y1: y1,
          x2: x1 + width,
          y2: y1 + height,
          confidence: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
          label: ['building', 'vehicle', 'tree', 'road', 'water body', 'vegetation'][Math.floor(Math.random() * 6)]
        };
      });
      result.count = objectCount;
      result.metrics = {
        bleuScore: '--',
        iou: '0.82',
        accuracy: '91%'
      };
    } 
    else if (queryType === 'vqa') {
      // Dummy VQA response
      const queryLower = query.toLowerCase();
      
      // Determine answer type and generate appropriate response
      if (queryLower.includes('how many') || queryLower.includes('count')) {
        result.answer = String(Math.floor(Math.random() * 50) + 5);
        result.answerType = 'numeric';
      } else if (queryLower.includes('is there') || queryLower.includes('are there') || queryLower.includes('does')) {
        result.answer = Math.random() > 0.5 ? 'Yes' : 'No';
        result.answerType = 'binary';
      } else if (queryLower.includes('what color') || queryLower.includes('what type') || queryLower.includes('which')) {
        const attributes = ['residential', 'commercial', 'industrial', 'agricultural', 'mixed-use', 'green/vegetation', 'blue/water', 'gray/concrete'];
        result.answer = attributes[Math.floor(Math.random() * attributes.length)];
        result.answerType = 'string';
      } else {
        result.answer = 'The predominant feature visible is urban infrastructure with residential buildings.';
        result.answerType = 'string';
      }
      
      result.confidence = 0.83;
      result.metrics = {
        bleuScore: '--',
        iou: '--',
        accuracy: '83%'
      };
    }

    return Response.json(result);

  } catch (error) {
    console.error('Processing Error:', error);
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
