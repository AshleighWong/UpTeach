'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Trash2 } from 'lucide-react'

export default function SyllabusUpload() {
  const [subject, setSubject] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const router = useRouter()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setFileName(file.name)
    
    if (!subject.trim()) {
      setError('Please enter a subject name')
      return
    }

    setIsLoading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject', subject)
    
    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to process syllabus')
      }
      
      const result = await response.json()
      console.log('Upload successful:', result)
      
      localStorage.setItem('syllabusSubject', subject)
      router.push('/syllabus/suggestions')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process syllabus')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFile = () => {
    setFileName('')
  }

  return (
    <main className="min-h-screen flex flex-col">
 <div className="bg-gray-200 py-4">
  <h1 className="text-4xl font-extrabold font-serif text-center text-white">UpTeach</h1>
</div>

      <div className="flex-1 bg-white px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-2">
            <label className="block text-gray-700">
              Type in the name of your subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="Enter subject name"
            />
          </div>

          {!fileName ? (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <div className="p-3 rounded-full bg-white mb-4">
                  <Upload className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-gray-600 font-medium">
                  Click to upload syllabus
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  or drag and drop it here
                </span>
              </label>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <h2 className="font-medium text-gray-700 mb-2">Uploaded Files:</h2>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {fileName}
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (!fileName) {
                document.getElementById('file-upload')?.click()
              } else {
                router.push('/syllabus/suggestions')
              }
            }}
            disabled={isLoading}
            className="w-full bg-black text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
          >
            Generate Suggestions
          </button>

          {error && (
            <div className="text-red-600 text-center p-2 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}