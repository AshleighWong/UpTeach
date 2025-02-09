// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-100">

      {/* Main Content Section */}
      <div className="flex-grow flex flex-col items-center justify-center gap-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
          <h2 className="text-2xl font-bold font-serif text-center text-gray-800 mb-2">
            What Would You Like to Upload?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Choose an option below to get started with your educational content
          </p>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="/syllabus"
              className="bg-black text-white font-serif font-bold py-4 px-8 rounded-xl text-center text-lg hover:bg-gray-800 transition-colors duration-200 flex-1 max-w-xs mx-auto"
            >
              Upload a Syllabus
            </Link>
            <Link
              href="/lesson"
              className="bg-black text-white font-serif font-bold py-4 px-8 rounded-xl text-center text-lg hover:bg-gray-800 transition-colors duration-200 flex-1 max-w-xs mx-auto"
            >
              Upload Lesson
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-300 py-6 mt-auto">
        <p className="text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} UpTeach. All rights reserved.
        </p>
      </div>
    </main>
  )
}