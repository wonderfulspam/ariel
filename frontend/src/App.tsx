import { useState } from 'react'

interface Character {
  name: string
  type: string
  dialogue_count: number
  voice_id: string | null
  sample_dialogue: string[]
}

interface AnalysisResult {
  characters: Character[]
  segments: number
  input_length: number
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
  }

  const analyzeFile = async () => {
    if (!file) return

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Analysis failed. Make sure the backend server is running.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateAudiobook = async () => {
    if (!file) return

    setIsGenerating(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (error) {
      console.error('Generation error:', error)
      alert('Generation failed. Check the console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ariel Audiobook Converter
          </h1>
          <p className="text-lg text-gray-600">
            Transform your stories into audiobooks with AI-generated character voices
          </p>
        </header>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Your Story</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="text-4xl mb-2">📖</div>
              <p className="text-lg font-medium text-gray-700 mb-1">
                {file ? file.name : 'Choose a text file'}
              </p>
              <p className="text-sm text-gray-500">
                Upload a .txt file to get started
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={analyzeFile}
                disabled={isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Characters'}
              </button>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Character Analysis</h2>
            <div className="grid gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Story Statistics</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Length:</span> {analysisResult.input_length.toLocaleString()} characters
                  </div>
                  <div>
                    <span className="font-medium">Segments:</span> {analysisResult.segments}
                  </div>
                  <div>
                    <span className="font-medium">Characters:</span> {analysisResult.characters.length}
                  </div>
                </div>
              </div>

              {analysisResult.characters.map((character, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg capitalize">
                      {character.name}
                      <span className="text-sm text-gray-500 ml-2">({character.type})</span>
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {character.dialogue_count} segments
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Voice:</strong> {character.voice_id || 'Default'}
                  </div>

                  {character.sample_dialogue.length > 0 && (
                    <div className="text-sm">
                      <strong>Sample dialogue:</strong>
                      <div className="mt-1 italic text-gray-600">
                        "{character.sample_dialogue[0]}"
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={generateAudiobook}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-3 rounded-md font-medium text-lg transition-colors"
              >
                {isGenerating ? 'Generating Audiobook...' : 'Generate Audiobook'}
              </button>
            </div>
          </div>
        )}

        {/* Download Section */}
        {downloadUrl && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Audiobook Ready!</h2>
            <div className="text-4xl mb-4">🎧</div>
            <a
              href={downloadUrl}
              download="audiobook.mp3"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium text-lg transition-colors inline-block"
            >
              Download Audiobook
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
