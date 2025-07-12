// Simple mock server for testing without requiring the full backend
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  rest.post('http://localhost:8000/analyze', (req, res, ctx) => {
    return res(
      ctx.json({
        characters: [
          {
            name: 'narrator',
            type: 'narrator',
            dialogue_count: 1,
            voice_id: 'en-US-AriaNeural',
            sample_dialogue: []
          }
        ],
        segments: 1,
        input_length: 30
      })
    );
  }),

  rest.post('http://localhost:8000/generate', (req, res, ctx) => {
    // Return a fake audio file blob
    const audioBuffer = new ArrayBuffer(1024);
    return res(
      ctx.set('Content-Type', 'audio/mpeg'),
      ctx.body(audioBuffer)
    );
  })
];

export const server = setupServer(...handlers);
