"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

interface Surah {
  number: number
  name: string
  englishName: string
  numberOfAyahs: number
  revelationType: string
}

interface Ayah {
  number: number
  text: string
  numberInSurah: number
  surah: { number: number; name: string }
}

interface Sheikh {
  id: number
  name: string
  server: string
}

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null)
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentAyah, setCurrentAyah] = useState<number | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>([])
  const [selectedReciter, setSelectedReciter] = useState<Sheikh>({
    id: 1,
    name: "مشاري راشد العفاسي",
    server: "https://server8.mp3quran.net/afs/",
  })
  const [availableReciters] = useState<Sheikh[]>([
    { id: 1, name: "مشاري راشد العفاسي", server: "https://server8.mp3quran.net/afs/" },
    { id: 2, name: "عبد الباسط عبد الصمد", server: "https://server8.mp3quran.net/abd_basit/Almusshaf-Al-Mojawwad/" },
    { id: 3, name: "محمد صديق المنشاوي", server: "https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/" },
    { id: 4, name: "ياسر الدوسري", server: "https://server11.mp3quran.net/yasser/" },
    { id: 5, name: "سعد الغامدي", server: "https://server7.mp3quran.net/s_gmd/" },
    { id: 6, name: "أحمد العجمي", server: "https://server6.mp3quran.net/ajm/" },
    { id: 7, name: "ماهر المعيقلي", server: "https://server12.mp3quran.net/maher/" },
    { id: 8, name: "عبد الرحمن السديس", server: "https://server11.mp3quran.net/sds/" },
    { id: 9, name: "فارس عباد", server: "https://server13.mp3quran.net/fares/" },
    { id: 10, name: "هاني الرفاعي", server: "https://server6.mp3quran.net/hani/" },
  ])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchSurahs()
    loadUserPreferences()
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.body.classList.add("dark-mode")
    }
  }, [])

  const fetchSurahs = async () => {
    try {
      const response = await fetch("https://api.alquran.cloud/v1/surah")
      const data = await response.json()
      setSurahs(data.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching surahs:", error)
      setLoading(false)
    }
  }

  const fetchSurahAyahs = async (surahNumber: number) => {
    try {
      setLoading(true)
      console.log(`[v0] Fetching ayahs for surah ${surahNumber}`)

      // Try multiple API endpoints for better reliability
      const apiEndpoints = [
        `https://api.alquran.cloud/v1/surah/${surahNumber}`,
        `https://api.quran.com/api/v4/chapters/${surahNumber}/verses/uthmani`,
        `https://quranapi.pages.dev/api/${surahNumber}.json`,
      ]

      let success = false

      for (const endpoint of apiEndpoints) {
        try {
          console.log(`[v0] Trying endpoint: ${endpoint}`)
          const response = await fetch(endpoint)

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()

          // Handle different API response formats
          if (endpoint.includes("alquran.cloud")) {
            setAyahs(data.data.ayahs)
            setSelectedSurah(data.data)
          } else if (endpoint.includes("quran.com")) {
            // Transform quran.com API response to match our format
            const transformedAyahs = data.verses.map((verse: any) => ({
              number: verse.id,
              text: verse.text_uthmani,
              numberInSurah: verse.verse_number,
              surah: { number: surahNumber, name: surahs.find((s) => s.number === surahNumber)?.name || "" },
            }))
            setAyahs(transformedAyahs)
            setSelectedSurah(surahs.find((s) => s.number === surahNumber) || null)
          } else {
            // Handle quranapi.pages.dev format
            const transformedAyahs = data.arabic1.map((text: string, index: number) => ({
              number: index + 1,
              text: text,
              numberInSurah: index + 1,
              surah: { number: surahNumber, name: surahs.find((s) => s.number === surahNumber)?.name || "" },
            }))
            setAyahs(transformedAyahs)
            setSelectedSurah(surahs.find((s) => s.number === surahNumber) || null)
          }

          success = true
          console.log(`[v0] Successfully loaded ayahs from ${endpoint}`)
          break
        } catch (endpointError) {
          console.log(`[v0] Failed to fetch from ${endpoint}:`, endpointError)
          continue
        }
      }

      if (!success) {
        console.log(`[v0] All API endpoints failed, using fallback data`)

        // Fallback ayah data for common surahs
        const fallbackAyahs = getFallbackAyahs(surahNumber)
        if (fallbackAyahs.length > 0) {
          setAyahs(fallbackAyahs)
          setSelectedSurah(
            surahs.find((s) => s.number === surahNumber) || {
              number: surahNumber,
              name: `السورة رقم ${surahNumber}`,
              englishName: `Surah ${surahNumber}`,
              numberOfAyahs: fallbackAyahs.length,
              revelationType: "Meccan",
            },
          )
        } else {
          // Show error message if no fallback available
          alert(`عذراً، لا يمكن تحميل السورة رقم ${surahNumber} حالياً. يرجى المحاولة لاحقاً.`)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("[v0] Error in fetchSurahAyahs:", error)
      setLoading(false)
      alert("حدث خطأ في تحميل الآيات. يرجى المحاولة مرة أخرى.")
    }
  }

  const getFallbackAyahs = (surahNumber: number): Ayah[] => {
    // Fallback data for Al-Fatiha (Surah 1)
    if (surahNumber === 1) {
      return [
        { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", numberInSurah: 1, surah: { number: 1, name: "الفاتحة" } },
        { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", numberInSurah: 2, surah: { number: 1, name: "الفاتحة" } },
        { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", numberInSurah: 3, surah: { number: 1, name: "الفاتحة" } },
        { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ", numberInSurah: 4, surah: { number: 1, name: "الفاتحة" } },
        { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", numberInSurah: 5, surah: { number: 1, name: "الفاتحة" } },
        { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", numberInSurah: 6, surah: { number: 1, name: "الفاتحة" } },
        {
          number: 7,
          text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          numberInSurah: 7,
          surah: { number: 1, name: "الفاتحة" },
        },
      ]
    }

    // Fallback for Al-Ikhlas (Surah 112)
    if (surahNumber === 112) {
      return [
        { number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", numberInSurah: 1, surah: { number: 112, name: "الإخلاص" } },
        { number: 2, text: "اللَّهُ الصَّمَدُ", numberInSurah: 2, surah: { number: 112, name: "الإخلاص" } },
        { number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", numberInSurah: 3, surah: { number: 112, name: "الإخلاص" } },
        { number: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", numberInSurah: 4, surah: { number: 112, name: "الإخلاص" } },
      ]
    }

    // Return empty array if no fallback available
    return []
  }

  const loadUserPreferences = () => {
    const savedFavorites = localStorage.getItem("quran_favorites")
    const savedDownloads = localStorage.getItem("downloaded_surahs")

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    if (savedDownloads) setDownloadedSurahs(JSON.parse(savedDownloads))
  }

  const toggleFavorite = (surahNumber: number) => {
    const newFavorites = favorites.includes(surahNumber)
      ? favorites.filter((f) => f !== surahNumber)
      : [...favorites, surahNumber]

    setFavorites(newFavorites)
    localStorage.setItem("quran_favorites", JSON.stringify(newFavorites))
  }

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

  const playAudio = async (surahNumber: number, ayahNumber: number) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    setCurrentAyah(ayahNumber)

    // Try multiple audio sources for better reliability
    const audioSources = [
      // Individual verse from selected reciter (if available)
      `https://verses.quran.com/${selectedReciter.server.includes("alafasy") ? "alafasy" : "abdulbasit"}/${surahNumber}_${ayahNumber}.mp3`,
      // Full surah from selected reciter
      `${selectedReciter.server}${surahNumber.toString().padStart(3, "0")}.mp3`,
      // Fallback to reliable source
      `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`,
    ]

    let audioPlayed = false

    for (const audioUrl of audioSources) {
      if (audioPlayed) break

      try {
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        audio.addEventListener("loadstart", () => {
          console.log(`[v0] Loading audio from: ${audioUrl}`)
        })

        await audio.play()
        setIsPlaying(true)
        audioPlayed = true

        audio.onended = () => {
          setCurrentAyah(null)
          setIsPlaying(false)
        }

        audio.onerror = () => {
          console.log(`[v0] Audio failed for: ${audioUrl}`)
          if (!audioPlayed) {
            // Try next source
            return
          }
        }

        break // Success, exit loop
      } catch (error) {
        console.log(`[v0] Playback error for ${audioUrl}:`, error)
        continue // Try next source
      }
    }

    if (!audioPlayed) {
      setCurrentAyah(null)
      setIsPlaying(false)
      alert("عذراً، لا يمكن تشغيل هذه الآية حالياً. جاري المحاولة مع مصدر آخر...")

      try {
        const fallbackUrl = `https://server8.mp3quran.net/afs/${surahNumber.toString().padStart(3, "0")}.mp3`
        const fallbackAudio = new Audio(fallbackUrl)
        audioRef.current = fallbackAudio
        await fallbackAudio.play()
        setIsPlaying(true)
        setCurrentAyah(ayahNumber) // Keep highlighting the clicked verse

        fallbackAudio.onended = () => {
          setCurrentAyah(null)
          setIsPlaying(false)
        }
      } catch (fallbackError) {
        console.log(`[v0] Fallback audio also failed:`, fallbackError)
        alert("عذراً، لا يمكن تشغيل التلاوة حالياً")
      }
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setCurrentAyah(null)
    }
  }

  const downloadSurah = async (surahNumber: number) => {
    try {
      const audioUrl = `https://server8.mp3quran.net/afs/${surahNumber.toString().padStart(3, "0")}.mp3`

      // Store download info in localStorage
      const newDownloads = [...downloadedSurahs, surahNumber]
      setDownloadedSurahs(newDownloads)
      localStorage.setItem("downloaded_surahs", JSON.stringify(newDownloads))
      localStorage.setItem(`surah_${surahNumber}_url`, audioUrl)

      alert("تم حفظ السورة للاستماع لاحقاً")
    } catch (error) {
      alert("حدث خطأ في التحميل")
    }
  }

  const filteredSurahs = surahs.filter(
    (surah) => surah.name.includes(searchTerm) || surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 text-white">
      {/* Spotify-style Header */}
      <header className="relative bg-gradient-to-r from-black via-gray-900 to-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/50 via-teal-900/50 to-cyan-900/50"></div>

        {/* Top Navigation */}
        <div className="relative z-10 flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              <span className="text-xl">🏠</span>
            </Link>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-xl">📖</span>
            </div>
            <h1 className="text-2xl font-bold">المصحف الشريف</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <span className="text-xl">{isDarkMode ? "☀️" : "🌙"}</span>
            </button>

            {/* Reciter Selection */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2">
              <label className="block text-emerald-300 mb-1 text-sm">القارئ:</label>
              <select
                value={selectedReciter.id}
                onChange={(e) => {
                  const reciter = availableReciters.find((r) => r.id === Number.parseInt(e.target.value))
                  if (reciter) setSelectedReciter(reciter)
                }}
                className="bg-transparent text-white focus:outline-none text-sm font-medium"
              >
                {availableReciters.map((reciter) => (
                  <option key={reciter.id} value={reciter.id} className="text-gray-800 bg-white">
                    {reciter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <div className="text-7xl mb-6 animate-float">📖</div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-green-400 to-emerald-400 bg-clip-text text-transparent">
            المصحف الشريف
          </h1>

          {selectedSurah && (
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 max-w-3xl mx-auto border border-white/20">
              <p className="text-3xl font-bold mb-3">{selectedSurah.name}</p>
              <p className="text-emerald-300 text-lg mb-2">
                {selectedSurah.englishName} - {selectedSurah.numberOfAyahs} آية
              </p>
              <p className="text-emerald-200 mb-4">القارئ: {selectedReciter.name}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => toggleFavorite(selectedSurah.number)}
                  className={`px-6 py-3 rounded-2xl transition-all font-medium ${
                    favorites.includes(selectedSurah.number)
                      ? "bg-red-500 hover:bg-red-400 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {favorites.includes(selectedSurah.number) ? "❤️" : "🤍"} المفضلة
                </button>
                <button
                  onClick={() => downloadSurah(selectedSurah.number)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-medium"
                >
                  💾 حفظ للاستماع لاحقاً
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spotify-style Audio Player */}
      {isPlaying && (
        <div className="fixed bottom-6 left-6 right-6 bg-black/80 backdrop-blur-xl rounded-3xl p-6 z-50 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center animate-pulse">
                <span className="text-2xl">🎵</span>
              </div>
              <div>
                <p className="font-bold text-lg">
                  {selectedSurah?.name} - الآية {currentAyah}
                </p>
                <p className="text-sm text-gray-400">القارئ: {selectedReciter.name}</p>
              </div>
            </div>
            <button
              onClick={stopAudio}
              className="p-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl transition-colors font-bold"
            >
              ⏹️ إيقاف
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Surahs Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">📚</span>
                السور
              </h2>

              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="ابحث عن سورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors pr-12"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : (
                  filteredSurahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => fetchSurahAyahs(surah.number)}
                      className={`w-full p-4 rounded-2xl text-right transition-all duration-300 ${
                        selectedSurah?.number === surah.number
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl transform scale-105"
                          : "bg-white/5 hover:bg-white/10 text-white hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{surah.name}</span>
                          {favorites.includes(surah.number) && <span className="text-red-400">❤️</span>}
                          {downloadedSurahs.includes(surah.number) && <span className="text-green-400">💾</span>}
                        </div>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            selectedSurah?.number === surah.number ? "bg-white/20" : "bg-green-500 text-white"
                          }`}
                        >
                          {surah.number}
                        </div>
                      </div>
                      <div className="text-sm opacity-75 mb-1">
                        {surah.englishName} - {surah.numberOfAyahs} آية
                      </div>
                      <div className="text-xs opacity-60">{surah.revelationType === "Meccan" ? "مكية" : "مدنية"}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ayahs Display */}
          <div className="lg:col-span-3">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10">
              {selectedSurah ? (
                <>
                  {/* Surah Header */}
                  <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8">
                    <div className="text-center">
                      <div className="inline-block border-3 border-white/30 rounded-2xl p-6 bg-white/10 backdrop-blur-sm">
                        <h2 className="text-4xl font-bold mb-3">{selectedSurah.name}</h2>
                        <p className="text-emerald-100 text-lg mb-2">
                          {selectedSurah.englishName} - {selectedSurah.numberOfAyahs} آية
                        </p>
                        <div className="flex justify-center items-center gap-4 text-sm">
                          <span className="bg-white/20 px-3 py-1 rounded-full">
                            {selectedSurah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                          </span>
                          <span className="bg-white/20 px-3 py-1 rounded-full">السورة رقم {selectedSurah.number}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-20">
                      <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-400">جاري تحميل الآيات...</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Bismillah */}
                      {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                        <div className="text-center py-8 bg-gradient-to-b from-amber-900/20 to-yellow-900/20 border-b border-amber-500/30">
                          <p className="text-4xl font-arabic text-green-400 mb-2">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                        </div>
                      )}

                      {/* Mushaf-style display */}
                      <div className="p-8 bg-gradient-to-b from-amber-900/10 via-yellow-900/10 to-orange-900/10 min-h-96">
                        <div className="mushaf-container bg-black/20 backdrop-blur-sm rounded-2xl p-8 shadow-inner border border-green-500/30">
                          <div className="mushaf-text leading-loose text-justify">
                            {ayahs.map((ayah, index) => (
                              <span key={ayah.number} className="ayah-container">
                                <span
                                  className={`font-arabic text-3xl transition-all duration-500 cursor-pointer inline ${
                                    currentAyah === ayah.numberInSurah
                                      ? "bg-green-500/30 text-green-300 rounded-lg px-2 py-1 shadow-lg"
                                      : "text-white hover:text-green-400"
                                  }`}
                                  onClick={() => playAudio(selectedSurah.number, ayah.numberInSurah)}
                                >
                                  {ayah.text}
                                </span>

                                <span
                                  className="ayah-number-container inline-flex items-center mx-3 my-1 cursor-pointer group"
                                  onClick={() => playAudio(selectedSurah.number, ayah.numberInSurah)}
                                >
                                  <span className="ayah-number relative inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-green-400 border-2 border-green-400 rounded-full hover:bg-green-500 hover:text-white transition-all duration-300 transform group-hover:scale-110 shadow-lg">
                                    {ayah.numberInSurah}
                                  </span>
                                </span>

                                {index < ayahs.length - 1 && <span className="mx-2"> </span>}
                              </span>
                            ))}
                          </div>

                          <div className="text-center mt-12 py-6">
                            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl shadow-lg border border-green-500/30">
                              <span className="text-green-400 text-xl">✦</span>
                              <span className="text-green-400 font-bold text-xl">صدق الله العظيم</span>
                              <span className="text-green-400 text-xl">✦</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="text-8xl mb-6 animate-bounce">📖</div>
                  <h3 className="text-3xl font-bold mb-4">اختر سورة للقراءة</h3>
                  <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                    اختر سورة من القائمة لبدء القراءة والاستماع
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ... existing styles ... */}
    </div>
  )
}
