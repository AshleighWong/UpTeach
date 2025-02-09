'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'

export default function SyllabusUpload() {
  const [subject, setSubject] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
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
      
      // Store the subject name
      localStorage.setItem('syllabusSubject', subject)
      
      // Navigate to suggestions page
      router.push('/syllabus/suggestions')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process syllabus')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="bg-gray-300 py-4">
        <h1 className="text-4xl font-extrabold font-serif text-center">UpTeach</h1>
      </div>

      <div className="flex-1 bg-white px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Type in the name of your subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter subject name"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
              <Upload className="w-12 h-12 text-blue-700 mb-4" />
              <span className="text-lg font-medium text-gray-900">
                {isLoading ? 'Processing...' : 'Choose a syllabus file'}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                or drag and drop it here
              </span>
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-center p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}