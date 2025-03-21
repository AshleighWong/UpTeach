'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function SyllabusUpload() {
  const [subject, setSubject] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFile(file)
      const localUrl = URL.createObjectURL(file)
      setPdfUrl(localUrl)
    }
  }

  const handleDeleteFile = () => {
    setFile(null)
    setPdfUrl(null)
    setSuggestion(null)
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please upload a syllabus file first')
      return
    }
    if (!subject.trim()) {
      alert('Please enter a subject name')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject', subject)

    try {
      suggestionsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })

      const uploadResponse = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadResponse.json()
      
      if (uploadData.filename) {
        const suggestionResponse = await fetch('http://127.0.0.1:5000/content-suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: uploadData.filename,
            subject: subject
          }),
        })
        const suggestionData = await suggestionResponse.json()
        
        if (suggestionData.suggestion) {
          setSuggestion(suggestionData.suggestion)
        }
      }
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <div className="py-4">
        <h1 className="text-4xl font-extrabold font-serif text-center">UpTeach</h1>
      </div>
      
      <div className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-gray-200 rounded-lg p-8">
            <label className="block w-full cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center space-y-4">
                <Upload className="w-12 h-12 text-gray-400" />
                <span className="text-gray-600">
                  Click to upload syllabus
                </span>
              </div>
            </label>
          </div>

          {file && (
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4 text-black">Uploaded Files:</h2>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{file.name}</span>
                </div>
                <button 
                  onClick={handleDeleteFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type in the name of your subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg text-black"
              placeholder="Enter subject name"
            />
          </div>

          <button
            className="w-full bg-black text-white font-bold py-4 px-6 rounded-lg disabled:bg-gray-400"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Generate Suggestions'}
          </button>

          {(pdfUrl || suggestion) && (
            <div 
              ref={suggestionsRef}
              className="flex flex-row gap-8"
            >
              {pdfUrl && (
                <div className="flex-1 border border-gray-200 rounded-lg bg-white">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-96 rounded-lg"
                    title="PDF Viewer"
                  />
                </div>
              )}

              {suggestion && (
                <div className="flex-1 bg-white rounded-lg p-6 h-96 overflow-y-auto">
                  <h2 className="text-lg font-medium mb-4 text-black">Suggestions:</h2>
                  <div className="prose max-w-none text-black">
                    <ReactMarkdown>{suggestion}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}