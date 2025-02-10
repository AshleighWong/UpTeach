'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Trash2 } from 'lucide-react'

interface Suggestion {
  content: string;
  link: string;
}

interface SlideSuggestion {
  slide: number;
  suggestions: Suggestion[];
}

export default function SyllabusUpload() {
  const [subject, setSubject] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fileType, setFileType] = useState<'pdf' | 'pptx' | null>(null)
  const [slideImages, setSlideImages] = useState<string[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [suggestions, setSuggestions] = useState<SlideSuggestion[]>([])
  const router = useRouter()
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFile(file)

      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (fileExtension === 'pdf') {
        setFileType('pdf')
        handlePdfConversion(file)
      } else {
        setFileType('pptx')
        handlePptxConversion(file)
      }
    }
  }

  const handlePdfConversion = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject', subject)

    try {
      const response = await fetch('http://127.0.0.1:5000/convert-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.slides && Array.isArray(data.slides)) {
        setSlideImages(data.slides)
      } else {
        throw new Error('Invalid response format for PDF')
      }
    } catch (error) {
      console.error('Error converting PDF:', error)
      alert('Error converting PDF file: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setSlideImages([])
    }
  }

  const handlePptxConversion = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject', subject)

    try {
      const response = await fetch('http://127.0.0.1:5000/convert-pptx', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Received slides data:', data) // Debug log
      
      if (data.slides && Array.isArray(data.slides)) {
        setSlideImages(data.slides)
        if (data.slides.length === 0) {
          console.warn('No slides were converted')
        }
      } else {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response format')
      }

    } catch (error) {
      console.error('Error converting PPTX:', error)
      alert('Error converting PowerPoint file: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setSlideImages([])
    }
  }

  const handleDeleteFile = () => {
    setFile(null)
    setPdfUrl(null)
    setSuggestion(null)
    setFileType(null)
    setSlideImages([])
    setCurrentSlide(0)
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please upload a Lesson Plan first')
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
      const suggestionResponse = await fetch('http://127.0.0.1:5000/lesson-plan', {
        method: 'POST',
        body: formData,
      })

      if (!suggestionResponse.ok) {
        throw new Error(`HTTP error! status: ${suggestionResponse.status}`)
      }

      const suggestionData = await suggestionResponse.json()
      
      if (suggestionData.suggestion) {
        try {
          const parsedSuggestions = typeof suggestionData.suggestion[0].suggestions[0].content === 'string' 
            ? suggestionData.suggestion[0].suggestions[0].content.replace(/\\/g, '').replace(/^"/, '').replace(/"$/, '')
            : suggestionData.suggestion[0].suggestions[0].content
          
            //replace '''json at the beginning
            //replace ''' at the end

            console.log(parsedSuggestions) // Debug log

            const parsed = JSON.parse(parsedSuggestions.replace(/^```json\s*/, '').replace(/\s*```$/, ''))


            console.log(parsed) // Debug log

          // Validate the structure
          if (Array.isArray(parsed)) {
            const validSuggestions = parsed.every(s => 
              s && 
              typeof s.slide === 'number' && 
              Array.isArray(s.suggestions) &&
              s.suggestions.every((sg: { content: any; link: any; }) => 
                sg && 
                typeof sg.content === 'string' && 
                typeof sg.link === 'string'
              )
            )

            if (validSuggestions) {
              setSuggestions(parsed)
              // Add setTimeout to ensure the suggestions are rendered before scrolling
              setTimeout(() => {
                suggestionsRef.current?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }, 100)
            } else {
              throw new Error('Invalid suggestion structure')
            }
          } else {
            throw new Error('Suggestions must be an array')
          }
        } catch (parseError) {
          console.error('Error parsing suggestions:', parseError)
          throw new Error('Invalid suggestion format')
        }
      }
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Add navigation functions for PowerPoint slides
  const nextSlide = () => {
    if (currentSlide < slideImages.length - 1) {
      setCurrentSlide(curr => curr + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(curr => curr - 1)
    }
  }

  // Function to get suggestions for current slide/page
  const getCurrentSuggestions = () => {
    try {
      return suggestions.filter(s => {
        return s && typeof s.slide === 'number' && s.slide === currentSlide + 1
      })
    } catch (error) {
      console.error('Error filtering suggestions:', error)
      return []
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm py-4 mb-4">
        <h1 className="text-3xl font-bold font-serif text-center text-gray-800">
          Lesson Plan Upload
        </h1>
      </div>
      
      <div className="flex-1 px-4 py-4 max-w-7xl mx-auto w-full">
        <div className="space-y-4"> {/* Reduced from space-y-8 to space-y-4 */}
          {/* Upload Area */}
          <div className="bg-gray-200 rounded-xl shadow-sm p-6 border border-gray-100"> {/* Reduced padding from p-8 to p-6 */}
            <label className="block w-full cursor-pointer transition-all duration-200 hover:opacity-80">
              <input
                type="file"
                className="hidden"
                accept=".pdf, .pptx"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center space-y-3 py-8"> {/* Reduced padding and spacing */}
                <Upload className="w-12 h-12 text-gray-400" /> {/* Reduced icon size */}
                <span className="text-gray-600 text-base">
                  Click to upload Lesson plan (PDF or PPTX)
                </span>
              </div>
            </label>
          </div>

          {/* Uploaded Files List */}
          {file && (
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"> {/* Reduced padding */}
              <h2 className="text-lg font-semibold text-gray-800 mb-2"> {/* Reduced margin and font size */}
                Uploaded File
              </h2>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">{file.name}</span>
                </div>
                <button 
                  onClick={handleDeleteFile}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Subject Input */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"> {/* Reduced padding */}
            <label className="block text-base font-medium text-gray-700 mb-2"> {/* Reduced margin and font size */}
              Subject Name
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black" // Added text-black
              placeholder="Enter the name of your subject"
            />
          </div>

          {/* Generate Button */}
          <button
            className="w-full bg-black text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-200 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Generate Suggestions'}
          </button>

          {/* Preview and Suggestions Section */}
          {(pdfUrl || slideImages.length > 0 || suggestions.length > 0) && (
            <div 
              ref={suggestionsRef}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {/* File Preview */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Preview</h2>
                {((fileType === 'pdf' || fileType === 'pptx') && slideImages.length > 0) ? (
                  <div className="relative">
                    <div className="aspect-[4/3] mb-4">
                      <img
                        src={slideImages[currentSlide]}
                        alt={`Page ${currentSlide + 1}`}
                        className="w-full h-full object-contain rounded-lg bg-gray-50"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-4">
                      <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg disabled:bg-gray-300 transition-colors duration-200"
                      >
                        Previous
                      </button>
                      <span className="text-lg font-medium text-black"> {/* Added text-black */}
                        {currentSlide + 1} / {slideImages.length}
                      </span>
                      <button
                        onClick={nextSlide}
                        disabled={currentSlide === slideImages.length - 1}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg disabled:bg-gray-300 transition-colors duration-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No preview available</p>
                  </div>
                )}
              </div>

              {/* Suggestions Display */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Suggestions for {fileType === 'pdf' ? 'Page' : 'Slide'} {currentSlide + 1}
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {getCurrentSuggestions().map((slideSuggestion, idx) => (
                    <div key={idx}>
                      {Array.isArray(slideSuggestion.suggestions) && 
                        slideSuggestion.suggestions.map((suggestion, subIdx) => (
                          <div key={`${idx}-${subIdx}`} className="mb-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-gray-700 text-lg mb-3">{suggestion.content}</p>
                            {suggestion.link && (
                              <a 
                                href={suggestion.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                              >
                                View Resource →
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  ))}
                  {getCurrentSuggestions().length === 0 && (
                    <p className="text-gray-500 text-lg text-center py-8">
                      No suggestions available for this {fileType === 'pdf' ? 'page' : 'slide'}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}