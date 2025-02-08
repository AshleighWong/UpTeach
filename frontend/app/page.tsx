// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="bg-gray-300 py-4">
        <h1 className="text-4xl font-extrabold font-serif text-center">Welcome to UpTeach!</h1>
      </div>

      {/* White Middle Section */}
      <div className="bg-white pt-28 pb-0">
        <h2 className="text-center font-black font-serif text-lg">What Would you Like to Update ?</h2>
      </div>

      {/* Buttons Section */}
      <div className="bg-gray-300 pt-28 pb-28">
      <div className="max-w-2xl mx-auto px-4 flex justify-between gap-8">
        <Link 
          href="/syllabus"
          className="bg-black text-white font-serif font-bold py-3 px-12 rounded-3xl text-center text-lg"
        >
          Upload a Syllabus
        </Link>
        <Link
          href="/lesson"
          className="bg-black text-white font-serif font-bold py-3 px-12 rounded-3xl text-center text-lg"
        >
          Upload Lesson
        </Link>
      </div>
    </div>

    </main>
  )
}