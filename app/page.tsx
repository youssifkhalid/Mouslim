"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [islamicDate, setIslamicDate] = useState("")
  const [dailyVerse, setDailyVerse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.body.classList.add("dark-mode")
    }

    const fetchData = async () => {
      try {
        // Get Islamic date
        const dateResponse = await fetch("https://api.aladhan.com/v1/gToH")
        const dateData = await dateResponse.json()
        if (dateData.data?.hijri?.date) {
          setIslamicDate(dateData.data.hijri.date)
        }

        // Get daily verse with better error handling
        const randomSurah = Math.floor(Math.random() * 114) + 1
        const verseResponse = await fetch(`https://api.alquran.cloud/v1/surah/${randomSurah}/ar`)
        const verseData = await verseResponse.json()

        if (verseData.data?.ayahs?.length > 0) {
          const randomAyah = verseData.data.ayahs[Math.floor(Math.random() * verseData.data.ayahs.length)]
          // Ensure we have surah information
          const enhancedAyah = {
            ...randomAyah,
            surah: {
              number: verseData.data.number,
              name: verseData.data.name,
            },
          }
          setDailyVerse(enhancedAyah)
        }
      } catch (error) {
        console.log("Data fetching error:", error)
        // Fallback verse if API fails
        setDailyVerse({
          text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
          numberInSurah: 2,
          surah: { name: "الطلاق", number: 65 },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.body.classList.add("dark-mode")
      localStorage.setItem("theme", "dark")
    } else {
      document.body.classList.remove("dark-mode")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      {/* Spotify-style Header */}
      <header className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-ping"></div>
        </div>

        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-xl">☪</span>
              </div>
              <h1 className="text-xl font-bold">القرآن الكريم</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <span className="text-lg">{isDarkMode ? "☀️" : "🌙"}</span>
              </button>
              <div className="text-right">
                <div className="text-sm font-medium">{currentTime.toLocaleTimeString("ar-SA")}</div>
                <div className="text-xs opacity-70">{currentTime.toLocaleDateString("ar-SA")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-6 text-center pt-20">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="text-9xl mb-8 animate-float">☪</div>
              <h1 className="text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-white via-green-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
                القرآن الكريم
              </h1>
              <p className="text-2xl md:text-3xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
                تجربة استماع وقراءة فريدة مع أجمل الأصوات وأحدث التقنيات
              </p>
            </div>

            {/* Daily Verse Card */}
            {loading ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 mb-12 border border-white/10">
                <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">جاري تحميل آية اليوم...</p>
              </div>
            ) : dailyVerse ? (
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 mb-12 border border-white/20 hover:border-white/30 transition-all duration-500 group">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-2xl font-bold text-green-400">آية اليوم</h3>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-bold mb-6 leading-relaxed font-arabic group-hover:text-green-300 transition-colors">
                  {dailyVerse.text}
                </p>
                <p className="text-gray-400 text-lg">
                  سورة {dailyVerse.surah?.name || "القرآن الكريم"} - الآية{" "}
                  {dailyVerse.numberInSurah || dailyVerse.number || ""}
                </p>
              </div>
            ) : null}

            {/* Main Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-16">
              <Link
                href="/quran"
                className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-16 py-8 rounded-full font-bold text-3xl transition-all duration-500 transform hover:scale-110 shadow-2xl min-w-[350px] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center gap-4">
                  <span className="text-5xl group-hover:animate-bounce">📖</span>
                  <span>المصحف الشريف</span>
                </div>
              </Link>

              <Link
                href="/reciters"
                className="group relative bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white px-16 py-8 rounded-full font-bold text-3xl transition-all duration-500 transform hover:scale-110 shadow-2xl min-w-[350px] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center gap-4">
                  <span className="text-5xl group-hover:animate-bounce">🎧</span>
                  <span>القراء المشهورين</span>
                </div>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { icon: "🔍", title: "بحث ذكي", desc: "ابحث في آيات القرآن بسهولة" },
                { icon: "💾", title: "حفظ محلي", desc: "احفظ التلاوات للاستماع لاحقاً" },
                { icon: "🎵", title: "تلاوات متنوعة", desc: "أكثر من 12 قارئ مشهور" },
                { icon: "📱", title: "تصميم متجاوب", desc: "يعمل على جميع الأجهزة" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 group hover:bg-white/10"
                >
                  <div className="text-5xl mb-4 group-hover:animate-bounce">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h3 className="text-3xl font-bold mb-8 text-center">إحصائيات المنصة</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { number: "114", label: "سورة", color: "text-green-400" },
                  { number: "6236", label: "آية", color: "text-blue-400" },
                  { number: "12+", label: "قارئ", color: "text-purple-400" },
                  { number: "∞", label: "بركة", color: "text-yellow-400" },
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div
                      className={`text-5xl font-black mb-2 ${stat.color} group-hover:scale-110 transition-transform`}
                    >
                      {stat.number}
                    </div>
                    <div className="text-gray-400 group-hover:text-white transition-colors">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700;900&display=swap');
        @font-face {
          font-family: 'UthmanicHafs';
          src: url('https://fonts.qurancomplex.gov.sa/wp-content/uploads/2020/11/UthmanicHafs.ttf') format('truetype');
        }
        
        body {
          font-family: 'Tajawal', 'Amiri', sans-serif;
          direction: rtl;
          background: #0f172a;
        }
        
        .font-arabic {
          font-family: 'UthmanicHafs', 'Amiri', serif;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(3deg); }
          50% { transform: translateY(-40px) rotate(0deg); }
          75% { transform: translateY(-20px) rotate(-3deg); }
        }
        
        /* Spotify-like scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #535353;
          border-radius: 6px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #1db954;
        }
      `}</style>
    </div>
  )
}
