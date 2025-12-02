import dotenv from 'dotenv';
dotenv.config();
import WebSocket, { WebSocketServer } from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const wss = new WebSocketServer({ port: 8080 }); // choose a port

wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'start') {
      const { streamId, prompt, category, imageUrl } = msg;

      try {
        // Build Gemini request (simplified – use your existing prompt logic)
        const stream = await model.generateContentStream({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${category} task: ${prompt}` },
                // if you use image, attach it via inlineData here, or send imageUrl to your own backend
              ],
            },
          ],
        });

        let fullText = '';
        let coords = null;

        for await (const chunk of stream.stream) {
          const piece = chunk.text(); // or extract from parts
          if (!piece) continue;

          fullText += piece;

          // Send partial chunk
          ws.send(
            JSON.stringify({
              type: 'partial',
              streamId,
              delta: piece,
            })
          );
        }

        // OPTIONAL: if your model returns JSON with coordinates; parse here.
        // Example: { "description": "...", "coordinates": [...] }
        try {
          const parsed = JSON.parse(fullText);
          fullText =
            parsed.description ||
            parsed.caption ||
            parsed.answer ||
            fullText;
          coords = parsed.coordinates || null;
        } catch {
          // not JSON, keep fullText as-is
        }

        // Send final "done"
        ws.send(
          JSON.stringify({
            type: 'done',
            streamId,
            full: fullText,
            coordinates: coords,
          })
        );
      } catch (err) {
        ws.send(
          JSON.stringify({
            type: 'error',
            streamId,
            error: err.message || 'Streaming failed',
          })
        );
      }
    }
  });
});

console.log('WebSocket server listening on ws://localhost:8080');