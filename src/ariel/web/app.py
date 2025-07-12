"""FastAPI web application for Ariel."""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pathlib import Path
import tempfile
import json
from typing import Any

from ..core.pipeline import ProcessingPipeline
from ..models import ProcessingConfig

app = FastAPI(title="Ariel Audiobook Converter", version="0.1.0")

# Mount static files
static_path = Path(__file__).parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Global pipeline instance
pipeline = ProcessingPipeline()

@app.get("/", response_class=HTMLResponse)
async def home():
    """Serve the main web interface."""
    html_path = Path(__file__).parent / "static" / "index.html"
    if html_path.exists():
        return FileResponse(str(html_path))
    
    # Fallback minimal HTML if file doesn't exist
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Ariel - Audiobook Converter</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .upload-area { border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
            .upload-area:hover { border-color: #999; }
            button { background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
            button:hover { background: #005a87; }
            .character-list { margin: 20px 0; }
            .character { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px; }
            .hidden { display: none; }
        </style>
    </head>
    <body>
        <h1>Ariel - Audiobook Converter</h1>
        <p>Transform text into audiobooks with AI-generated voices for different characters.</p>
        
        <div id="upload-section">
            <div class="upload-area" onclick="document.getElementById('file-input').click()">
                <p>Click here or drag and drop a text file to upload</p>
                <input type="file" id="file-input" accept=".txt" style="display: none;">
            </div>
            <button onclick="uploadFile()">Upload and Analyze</button>
        </div>
        
        <div id="analysis-section" class="hidden">
            <h2>Character Analysis</h2>
            <div id="character-list" class="character-list"></div>
            <button onclick="generateAudio()">Generate Audiobook</button>
        </div>
        
        <div id="generation-section" class="hidden">
            <h2>Audio Generation</h2>
            <div id="progress"></div>
            <div id="download-link"></div>
        </div>
        
        <script>
            let currentFile = null;
            let characters = [];
            
            async function uploadFile() {
                const fileInput = document.getElementById('file-input');
                const file = fileInput.files[0];
                if (!file) {
                    alert('Please select a file');
                    return;
                }
                
                currentFile = file;
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                    const response = await fetch('/analyze', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }
                    
                    const result = await response.json();
                    characters = result.characters;
                    displayCharacters(characters);
                    
                    document.getElementById('upload-section').classList.add('hidden');
                    document.getElementById('analysis-section').classList.remove('hidden');
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            function displayCharacters(characters) {
                const container = document.getElementById('character-list');
                container.innerHTML = '';
                
                characters.forEach((char, index) => {
                    const div = document.createElement('div');
                    div.className = 'character';
                    div.innerHTML = `
                        <h3>${char.name} (${char.type})</h3>
                        <p>Dialogue count: ${char.dialogue_count}</p>
                        <p>Voice: ${char.voice_id || 'Default'}</p>
                        <p>Sample dialogue: "${char.sample_dialogue[0] || 'None'}"</p>
                    `;
                    container.appendChild(div);
                });
            }
            
            async function generateAudio() {
                if (!currentFile) {
                    alert('No file selected');
                    return;
                }
                
                const formData = new FormData();
                formData.append('file', currentFile);
                
                try {
                    document.getElementById('analysis-section').classList.add('hidden');
                    document.getElementById('generation-section').classList.remove('hidden');
                    document.getElementById('progress').innerHTML = 'Generating audiobook...';
                    
                    const response = await fetch('/generate', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error('Generation failed');
                    }
                    
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    
                    document.getElementById('progress').innerHTML = 'Complete!';
                    document.getElementById('download-link').innerHTML = `
                        <a href="${url}" download="audiobook.mp3">Download Audiobook</a>
                    `;
                } catch (error) {
                    document.getElementById('progress').innerHTML = 'Error: ' + error.message;
                }
            }
        </script>
    </body>
    </html>
    """)

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    """Analyze uploaded text file and return character information."""
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")
    
    # Read the uploaded file
    content = await file.read()
    text = content.decode('utf-8')
    
    # Process with dry run to get character analysis
    try:
        result = await pipeline.process_text(text, dry_run=True)
        return {
            "characters": result["characters"],
            "segments": len(result["segments"]),
            "input_length": result["input_length"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/generate")
async def generate_audiobook(file: UploadFile = File(...)):
    """Generate audiobook from uploaded text file."""
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")
    
    # Read the uploaded file
    content = await file.read()
    text = content.decode('utf-8')
    
    # Generate temporary output file
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
        temp_path = Path(temp_file.name)
    
    try:
        # Process the text and generate audio
        result = await pipeline.process_text(text, output_file=temp_path)
        
        # Return the generated audio file
        return FileResponse(
            str(result["output_file"]),
            media_type="audio/mpeg",
            filename="audiobook.mp3"
        )
    except Exception as e:
        # Clean up temp file on error
        if temp_path.exists():
            temp_path.unlink()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.get("/voices")
async def list_voices():
    """List available voices."""
    try:
        voices = await pipeline.list_available_voices()
        return {"voices": voices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list voices: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)