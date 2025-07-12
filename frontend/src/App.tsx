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

interface ErrorState {
  message: string
  type: 'error' | 'warning' | 'info'
  details?: string
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<ErrorState | null>(null)

  const clearError = () => setError(null)

  const validateFile = (file: File): ErrorState | null => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.txt')) {
      return {
        message: 'Invalid file type',
        type: 'error',
        details: 'Please select a .txt file. Other formats are not currently supported.'
      }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        message: 'File too large',
        type: 'error',
        details: `File size is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed size is 10MB.`
      }
    }

    // Check for empty file
    if (file.size === 0) {
      return {
        message: 'Empty file',
        type: 'error',
        details: 'The selected file appears to be empty. Please choose a file with text content.'
      }
    }

    return null
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    
    if (selectedFile) {
      const fileError = validateFile(selectedFile)
      if (fileError) {
        setError(fileError)
        setFile(null)
        return
      }
    }
    
    clearError()
    setFile(selectedFile)
    setAnalysisResult(null)
    setDownloadUrl(null)
  }

  const analyzeFile = async () => {
    if (!file) return

    clearError()
    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        let errorMessage = 'Analysis failed'
        let errorDetails = 'An unexpected error occurred during text analysis.'

        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}))
          errorMessage = 'Invalid file or content'
          errorDetails = errorData.detail || 'The file format or content is not supported.'
        } else if (response.status === 413) {
          errorMessage = 'File too large'
          errorDetails = 'The selected file is too large to process. Please try a smaller file.'
        } else if (response.status === 422) {
          errorMessage = 'Invalid request'
          errorDetails = 'The file could not be processed. Please check the file format and try again.'
        } else if (response.status >= 500) {
          errorMessage = 'Server error'
          errorDetails = 'The server encountered an error. Please try again later, or check if the backend service is running.'
        }

        setError({
          message: errorMessage,
          type: 'error',
          details: errorDetails
        })
        return
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis error:', error)
      
      let errorMessage = 'Analysis failed'
      let errorDetails = 'An unexpected error occurred.'

      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          errorMessage = 'Request timeout'
          errorDetails = 'The analysis took too long to complete. Please try with a smaller file.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Connection failed'
          errorDetails = 'Unable to connect to the server. Please check your internet connection and ensure the backend service is running.'
        } else {
          errorDetails = error.message
        }
      }

      setError({
        message: errorMessage,
        type: 'error',
        details: errorDetails
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateAudiobook = async () => {
    if (!file) return

    clearError()
    setIsGenerating(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(120000), // 2 minute timeout for audio generation
      })

      if (!response.ok) {
        let errorMessage = 'Audio generation failed'
        let errorDetails = 'An unexpected error occurred during audio generation.'

        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}))
          errorMessage = 'Invalid file or content'
          errorDetails = errorData.detail || 'The file cannot be converted to audio. Please check the file content.'
        } else if (response.status === 422) {
          errorMessage = 'Processing error'
          errorDetails = 'The text could not be processed for audio generation. Please check the file content.'
        } else if (response.status === 500) {
          errorMessage = 'Text-to-speech service error'
          errorDetails = 'The audio generation service is currently unavailable. This may be due to high demand or a temporary service outage. Please try again in a few minutes.'
        } else if (response.status === 503) {
          errorMessage = 'Service temporarily unavailable'
          errorDetails = 'The audio generation service is temporarily overloaded. Please try again in a few minutes.'
        }

        setError({
          message: errorMessage,
          type: response.status === 500 ? 'warning' : 'error',
          details: errorDetails
        })
        return
      }

      const blob = await response.blob()
      
      // Validate the response is actually audio
      if (blob.size === 0) {
        setError({
          message: 'Empty audio file',
          type: 'error',
          details: 'The generated audio file is empty. Please try again or contact support.'
        })
        return
      }

      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (error) {
      console.error('Generation error:', error)
      
      let errorMessage = 'Audio generation failed'
      let errorDetails = 'An unexpected error occurred.'

      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          errorMessage = 'Generation timeout'
          errorDetails = 'Audio generation took too long to complete. This may happen with longer texts. Please try with a shorter text or try again later.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Connection failed'
          errorDetails = 'Unable to connect to the server. Please check your internet connection and ensure the backend service is running.'
        } else {
          errorDetails = error.message
        }
      }

      setError({
        message: errorMessage,
        type: error instanceof Error && error.name === 'TimeoutError' ? 'warning' : 'error',
        details: errorDetails
      })
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

        {/* Error Display */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${
            error.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : error.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">
                    {error.type === 'error' ? '❌' : error.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <h3 className="font-semibold">{error.message}</h3>
                </div>
                {error.details && (
                  <p className="text-sm opacity-90">{error.details}</p>
                )}
              </div>
              <button
                onClick={clearError}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss error"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>
        )}

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
