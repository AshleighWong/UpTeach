'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function SyllabusUpload() {
  const [subject, setSubject] = useState('')
  const [fileName, setFileName] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
    }
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
          >
            Generate Suggestions
          </button>
        </div>
      </div>
    </main>
  )
}