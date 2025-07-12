// Comprehensive mock server for testing both happy and unhappy paths
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Default successful responses
const successfulAnalysisResponse = {
  characters: [
    {
      name: 'narrator',
      type: 'narrator',
      dialogue_count: 2,
      voice_id: 'en-US-AriaNeural',
      sample_dialogue: ['Once upon a time...']
    },
    {
      name: 'character',
      type: 'character', 
      dialogue_count: 1,
      voice_id: 'en-US-DavisNeural',
      sample_dialogue: ['Hello there!']
    }
  ],
  segments: 3,
  input_length: 100
};

const createAudioBuffer = (size = 1024) => {
  const audioBuffer = new ArrayBuffer(size);
  const view = new Uint8Array(audioBuffer);
  // Fill with some mock audio data
  for (let i = 0; i < size; i++) {
    view[i] = Math.floor(Math.random() * 256);
  }
  return audioBuffer;
};

// Error scenario helpers
const getErrorScenario = (url: string) => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('error_scenario');
};

export const handlers = [
  // Health check endpoint
  http.get('http://localhost:8000/health', () => {
    return HttpResponse.json({ status: 'healthy', service: 'ariel-backend' });
  }),

  // Voice listing endpoint
  http.get('http://localhost:8000/voices', ({ request }) => {
    const errorScenario = getErrorScenario(request.url);
    
    if (errorScenario === 'voices_unavailable') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Voice service temporarily unavailable' }), 
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return HttpResponse.json([
      { id: 'en-US-AriaNeural', name: 'Aria', language: 'en-US', gender: 'Female' },
      { id: 'en-US-DavisNeural', name: 'Davis', language: 'en-US', gender: 'Male' },
      { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US', gender: 'Female' }
    ]);
  }),

  // Analysis endpoint with comprehensive error handling
  http.post('http://localhost:8000/analyze', async ({ request }) => {
    const errorScenario = getErrorScenario(request.url);
    
    // Error scenarios
    if (errorScenario === 'invalid_file') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Only .txt files are supported' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorScenario === 'file_too_large') {
      return new HttpResponse(
        JSON.stringify({ detail: 'File too large. Maximum size is 10MB.' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorScenario === 'unprocessable_content') {
      return new HttpResponse(
        JSON.stringify({ detail: 'File content could not be processed' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorScenario === 'server_error') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Internal server error during analysis' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorScenario === 'timeout') {
      // Simulate timeout by delaying response
      await new Promise(resolve => setTimeout(resolve, 35000));
      return HttpResponse.json(successfulAnalysisResponse);
    }
    
    if (errorScenario === 'network_error') {
      return HttpResponse.error();
    }

    // Check for empty file scenario
    const formData = await request.text();
    if (formData.length < 100) { // Very small form data suggests empty file
      return new HttpResponse(
        JSON.stringify({ detail: 'File appears to be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Success case
    return HttpResponse.json(successfulAnalysisResponse);
  }),

  // Audio generation endpoint with comprehensive error handling
  http.post('http://localhost:8000/generate', async ({ request }) => {
    const errorScenario = getErrorScenario(request.url);
    
    // Error scenarios
    if (errorScenario === 'invalid_file') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Invalid file format for audio generation' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorScenario === 'processing_error') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Text could not be processed for audio generation' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorScenario === 'tts_service_error') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Text-to-speech service is currently unavailable' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorScenario === 'service_overloaded') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Service temporarily overloaded. Please try again later.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorScenario === 'timeout') {
      // Simulate timeout by delaying response
      await new Promise(resolve => setTimeout(resolve, 125000));
      return new HttpResponse(createAudioBuffer(), {
        headers: { 'Content-Type': 'audio/mpeg' }
      });
    }
    
    if (errorScenario === 'network_error') {
      return HttpResponse.error();
    }
    
    if (errorScenario === 'empty_audio') {
      return new HttpResponse(new ArrayBuffer(0), {
        headers: { 'Content-Type': 'audio/mpeg' }
      });
    }

    // Success case - return mock audio file
    return new HttpResponse(createAudioBuffer(2048), {
      headers: { 'Content-Type': 'audio/mpeg' }
    });
  })
];

export const server = setupServer(...handlers);

// Helper functions for tests to override specific endpoints
export const mockAnalysisError = (errorType: string) => {
  server.use(
    http.post('http://localhost:8000/analyze', async () => {
      switch (errorType) {
        case 'network':
          return HttpResponse.error();
        case 'timeout':
          await new Promise(resolve => setTimeout(resolve, 35000));
          return HttpResponse.json(successfulAnalysisResponse);
        case 'server_error':
          return new HttpResponse(
            JSON.stringify({ detail: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        default:
          return new HttpResponse(
            JSON.stringify({ detail: 'Bad request' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
      }
    })
  );
};

export const mockGenerationError = (errorType: string) => {
  server.use(
    http.post('http://localhost:8000/generate', async () => {
      switch (errorType) {
        case 'network':
          return HttpResponse.error();
        case 'timeout':
          await new Promise(resolve => setTimeout(resolve, 125000));
          return new HttpResponse(createAudioBuffer(), {
            headers: { 'Content-Type': 'audio/mpeg' }
          });
        case 'tts_error':
          return new HttpResponse(
            JSON.stringify({ detail: 'TTS service error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        case 'empty_audio':
          return new HttpResponse(new ArrayBuffer(0), {
            headers: { 'Content-Type': 'audio/mpeg' }
          });
        default:
          return new HttpResponse(
            JSON.stringify({ detail: 'Bad request' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
      }
    })
  );
};

export const resetMocks = () => {
  server.resetHandlers();
};
