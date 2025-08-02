#!/bin/bash
set -e

echo "🧪 Running Ariel Integration Tests"
echo "=================================="

# Backend Health Check
echo "📡 Testing backend health..."
HEALTH=$(curl -s http://localhost:8000/health)
if [[ $HEALTH == *"healthy"* ]]; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"; exit 1
fi

# Frontend availability
echo "🌐 Testing frontend availability..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [[ $STATUS == "200" ]]; then
    echo "✅ Frontend is serving content"
else
    echo "❌ Frontend not available (status: $STATUS)"; exit 1
fi

# Create output directory for test files
OUTPUT_DIR="./output"
mkdir -p "$OUTPUT_DIR"
TEST_DIR="$OUTPUT_DIR/integration_test"
mkdir -p "$TEST_DIR"

# Text Analysis API
echo "📝 Testing text analysis..."
echo 'Test story. "Hello!" said Alice. "Goodbye!" replied Bob.' > "$TEST_DIR/test_story.txt"
ANALYSIS=$(curl -s -X POST -F "file=@$TEST_DIR/test_story.txt" http://localhost:8000/analyze)
if [[ $ANALYSIS == *"characters"* ]] && [[ $ANALYSIS == *"narrator"* ]]; then
    echo "✅ Text analysis working"
else
    echo "❌ Text analysis failed"; exit 1
fi

# Voice listing
echo "🎤 Testing voice listing..."
VOICES=$(curl -s http://localhost:8000/voices)
VOICE_COUNT=$(echo $VOICES | grep -o '"id":"[^"]*"' | wc -l)
if [[ $VOICE_COUNT -gt 100 ]]; then
    echo "✅ Voice listing working ($VOICE_COUNT voices available)"
else
    echo "❌ Voice listing failed"; exit 1
fi

# Audio Generation
echo "🔊 Testing audio generation..."
echo 'Short test for audio.' > "$TEST_DIR/audio_test.txt"
curl -s -X POST -F "file=@$TEST_DIR/audio_test.txt" http://localhost:8000/generate -o "$TEST_DIR/test_audio.mp3"
if [[ -f "$TEST_DIR/test_audio.mp3" ]] && [[ $(stat -f%z "$TEST_DIR/test_audio.mp3" 2>/dev/null || stat -c%s "$TEST_DIR/test_audio.mp3") -gt 1000 ]]; then
    echo "✅ Audio generation working"
else
    echo "❌ Audio generation failed"; exit 1
fi

# React app
echo "⚛️ Testing React app loading..."
FRONTEND_CONTENT=$(curl -s http://localhost:5173)
if [[ $FRONTEND_CONTENT == *"react"* ]] && [[ $FRONTEND_CONTENT == *"root"* ]]; then
    echo "✅ React app loading correctly"
else
    echo "❌ React app not loading properly"; exit 1
fi

echo ""
echo "🎉 All tests passed! Ariel is working perfectly."
echo "📁 Test files saved in: $TEST_DIR"

# Note: Test files are kept in the output directory for inspection
