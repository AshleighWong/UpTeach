'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SyllabusUpload() {
  const [subject, setSubject] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState<ArrayBuffer | null>(null)
  const [storedFiles, setStoredFiles] = useState<string[]>([])
  const router = useRouter()

  // Load stored files on component mount
  useEffect(() => {
    const syllabusFile = localStorage.getItem('syllabusFile')
    const storedFileName = localStorage.getItem('syllabusFileName')
    if (syllabusFile && storedFileName) {
      setStoredFiles([storedFileName])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileName(file.name)
      
      // Read the file content
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          // Store the file content in state
          setFileContent(e.target.result as ArrayBuffer)
          // Store the file in localStorage (as base64)
          localStorage.setItem('syllabusFile', btoa(
            new Uint8Array(e.target.result as ArrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          ))
          // Store the filename
          localStorage.setItem('syllabusFileName', file.name)
          setStoredFiles([file.name])
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const handleGenerateClick = () => {
    if (!fileContent) {
      alert('Please upload a syllabus file first')
      return
    }
    if (!subject.trim()) {
      alert('Please enter a subject name')
      return
    }

    // Store the subject in localStorage
    localStorage.setItem('syllabusSubject', subject)
    
    // Navigate to suggestions page
    router.push('/lesson/suggestions')
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-300 py-4">
        <h1 className="text-4xl font-extrabold font-serif text-center">UpTeach</h1>
      </div>

      {/* Upload Form Section */}
      <div className="flex-1 bg-white px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* File Upload Button */}
          <div className="bg-gray-300 border-2 border-gray-300 rounded-lg p-8">
            <label className="block w-full cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center space-y-4">
                <svg 
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-gray-600">
                  {fileName || 'Click to upload syllabus'}
                </span>
              </div>
            </label>
          </div>

          {/* Stored Files List */}
          {storedFiles.length > 0 && (
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <h2 className="font-medium text-gray-700 mb-2">Uploaded Files:</h2>
              <ul className="space-y-2">
                {storedFiles.map((name, index) => (
                  <li key={index} className="flex items-center justify-between text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <svg 
                        className="w-5 h-5 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      {name}
                    </div>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        setStoredFiles([]);
                        setFileContent(null);
                        setFileName('');
                        setSubject('');
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Subject Input */}
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

          {/* Generate Button */}
          <button
            className="w-full bg-black text-white font-bold py-3 px-6 rounded-md"
            onClick={handleGenerateClick}>
            Generate Lesson
          </button>
        </div>
      </div>
    </main>
  )
}