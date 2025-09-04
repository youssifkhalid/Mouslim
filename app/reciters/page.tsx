"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

interface Sheikh {
  id: number
  name: string
  letter: string
  server: string
  rewaya: string
  count: number
  image?: string
}

interface Surah {
  number: number
  name: string
  englishName: string
  numberOfAyahs: number
}

interface Ayah {
  number: number
  text: string
  numberInSurah: number
}

export default function RecitersPage() {
  const [sheikhs, setSheikhs] = useState<Sheikh[]>([])
  const [selectedSheikh, setSelectedSheikh] = useState<Sheikh | null>(null)
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [currentSurah, setCurrentSurah] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [downloadedRecitations, setDownloadedRecitations] = useState<string[]>([])
  const [showQuran, setShowQuran] = useState(false)
  const [selectedSurahForQuran, setSelectedSurahForQuran] = useState<Surah | null>(null)
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [loadingAyahs, setLoadingAyahs] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(false)
  const [currentPlayingSurah, setCurrentPlayingSurah] = useState<Surah | null>(null)
  const [currentPlayingSheikh, setCurrentPlayingSheikh] = useState<Sheikh | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchSheikhs()
    fetchSurahs()
    loadDownloadedRecitations()
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.body.classList.add("dark-mode")
    }
  }, [])

  const fetchSheikhs = async () => {
    try {
      console.log("[v0] Attempting to fetch sheikhs from API...")
      const response = await fetch("https://mp3quran.net/api/v3/reciters?language=ar")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Successfully fetched sheikhs from API")
      setSheikhs(data.reciters || [])
      setLoading(false)
    } catch (error) {
      console.log("[v0] API fetch failed, using fallback data:", error)
      const fallbackSheikhs = [
        {
          id: 1,
          name: "عبد الباسط عبد الصمد",
          letter: "ع",
          server: "https://server8.mp3quran.net/abd_basit/Almusshaf-Al-Mojawwad/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 2,
          name: "محمد صديق المنشاوي",
          letter: "م",
          server: "https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 3,
          name: "ياسر الدوسري",
          letter: "ي",
          server: "https://server11.mp3quran.net/yasser/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 4,
          name: "مشاري راشد العفاسي",
          letter: "م",
          server: "https://server8.mp3quran.net/afs/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 5,
          name: "سعد الغامدي",
          letter: "س",
          server: "https://server7.mp3quran.net/s_gmd/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 6,
          name: "أحمد العجمي",
          letter: "أ",
          server: "https://server6.mp3quran.net/ajm/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 7,
          name: "ماهر المعيقلي",
          letter: "م",
          server: "https://server12.mp3quran.net/maher/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 8,
          name: "عبد الرحمن السديس",
          letter: "ع",
          server: "https://server11.mp3quran.net/sds/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 9,
          name: "فارس عباد",
          letter: "ف",
          server: "https://server13.mp3quran.net/fares/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 10,
          name: "هاني الرفاعي",
          letter: "ه",
          server: "https://server6.mp3quran.net/hani/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 11,
          name: "عبد الله بصفر",
          letter: "ع",
          server: "https://server14.mp3quran.net/basfar/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 12,
          name: "محمد أيوب",
          letter: "م",
          server: "https://server15.mp3quran.net/ayyub/",
          rewaya: "حفص عن عاصم",
          count: 114,
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        },
      ]
      setSheikhs(fallbackSheikhs)
      setLoading(false)
    }
  }

  const fetchSurahs = async () => {
    try {
      console.log("[v0] Fetching surahs...")
      const response = await fetch("https://api.alquran.cloud/v1/surah")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Successfully fetched surahs")
      setSurahs(data.data)
    } catch (error) {
      console.log("[v0] Surahs API failed, using fallback data:", error)
      const fallbackSurahs = [
        { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", numberOfAyahs: 7 },
        { number: 2, name: "البقرة", englishName: "Al-Baqarah", numberOfAyahs: 286 },
        { number: 3, name: "آل عمران", englishName: "Ali 'Imran", numberOfAyahs: 200 },
        { number: 4, name: "النساء", englishName: "An-Nisa", numberOfAyahs: 176 },
        { number: 5, name: "المائدة", englishName: "Al-Ma'idah", numberOfAyahs: 120 },
        { number: 6, name: "الأنعام", englishName: "Al-An'am", numberOfAyahs: 165 },
        { number: 7, name: "الأعراف", englishName: "Al-A'raf", numberOfAyahs: 206 },
        { number: 8, name: "الأنفال", englishName: "Al-Anfal", numberOfAyahs: 75 },
        { number: 9, name: "التوبة", englishName: "At-Tawbah", numberOfAyahs: 129 },
        { number: 10, name: "يونس", englishName: "Yunus", numberOfAyahs: 109 },
        { number: 11, name: "هود", englishName: "Hud", numberOfAyahs: 123 },
        { number: 12, name: "يوسف", englishName: "Yusuf", numberOfAyahs: 111 },
        { number: 13, name: "الرعد", englishName: "Ar-Ra'd", numberOfAyahs: 43 },
        { number: 14, name: "إبراهيم", englishName: "Ibrahim", numberOfAyahs: 52 },
        { number: 15, name: "الحجر", englishName: "Al-Hijr", numberOfAyahs: 99 },
        { number: 16, name: "النحل", englishName: "An-Nahl", numberOfAyahs: 128 },
        { number: 17, name: "الإسراء", englishName: "Al-Isra", numberOfAyahs: 111 },
        { number: 18, name: "الكهف", englishName: "Al-Kahf", numberOfAyahs: 110 },
        { number: 19, name: "مريم", englishName: "Maryam", numberOfAyahs: 98 },
        { number: 20, name: "طه", englishName: "Taha", numberOfAyahs: 135 },
        { number: 21, name: "الأنبياء", englishName: "Al-Anbya", numberOfAyahs: 112 },
        { number: 22, name: "الحج", englishName: "Al-Hajj", numberOfAyahs: 78 },
        { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", numberOfAyahs: 118 },
        { number: 24, name: "النور", englishName: "An-Nur", numberOfAyahs: 64 },
        { number: 25, name: "الفرقان", englishName: "Al-Furqan", numberOfAyahs: 77 },
        { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", numberOfAyahs: 227 },
        { number: 27, name: "النمل", englishName: "An-Naml", numberOfAyahs: 93 },
        { number: 28, name: "القصص", englishName: "Al-Qasas", numberOfAyahs: 88 },
        { number: 29, name: "العنكبوت", englishName: "Al-'Ankabut", numberOfAyahs: 69 },
        { number: 30, name: "الروم", englishName: "Ar-Rum", numberOfAyahs: 60 },
        { number: 67, name: "الملك", englishName: "Al-Mulk", numberOfAyahs: 30 },
        { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", numberOfAyahs: 4 },
        { number: 113, name: "الفلق", englishName: "Al-Falaq", numberOfAyahs: 5 },
        { number: 114, name: "الناس", englishName: "An-Nas", numberOfAyahs: 6 },
      ]
      setSurahs(fallbackSurahs)
    }
  }

  const loadDownloadedRecitations = () => {
    const downloaded = localStorage.getItem("downloaded_recitations")
    if (downloaded) {
      setDownloadedRecitations(JSON.parse(downloaded))
    }
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

  const fetchSurahAyahs = async (surahNumber: number) => {
    setLoadingAyahs(true)
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      setAyahs(data.data.ayahs || [])
    } catch (error) {
      console.log("[v0] Ayahs API failed, using fallback data:", error)
      const fallbackAyahs =
        surahNumber === 1
          ? [
              { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", numberInSurah: 1 },
              { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", numberInSurah: 2 },
              { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", numberInSurah: 3 },
              { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ", numberInSurah: 4 },
              { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", numberInSurah: 5 },
              { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", numberInSurah: 6 },
              { number: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", numberInSurah: 7 },
            ]
          : [{ number: 1, text: "لم يتم تحميل الآيات، يرجى المحاولة لاحقاً", numberInSurah: 1 }]
      setAyahs(fallbackAyahs)
    }
    setLoadingAyahs(false)
  }

  const playAudio = async (sheikh: Sheikh, surah: Surah) => {
    setCurrentPlayingSurah(surah)
    setCurrentPlayingSheikh(sheikh)
    setSelectedSurahForQuran(surah)
    setShowSpotifyPlayer(true)
    setShowQuran(true)
    await fetchSurahAyahs(surah.number)

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audioSources = [
      `${sheikh.server}${surah.number.toString().padStart(3, "0")}.mp3`,
      `https://server8.mp3quran.net/afs/${surah.number.toString().padStart(3, "0")}.mp3`,
      `https://server7.mp3quran.net/s_gmd/${surah.number.toString().padStart(3, "0")}.mp3`,
      `https://server11.mp3quran.net/yasser/${surah.number.toString().padStart(3, "0")}.mp3`,
      `https://server12.mp3quran.net/maher/${surah.number.toString().padStart(3, "0")}.mp3`,
    ]

    let audioPlayed = false

    for (const audioUrl of audioSources) {
      if (audioPlayed) break

      try {
        console.log(`[v0] Trying audio source: ${audioUrl}`)
        const audio = new Audio(audioUrl)
        audioRef.current = audio
        audio.volume = volume

        audio.addEventListener("loadedmetadata", () => {
          setDuration(audio.duration)
        })

        audio.addEventListener("timeupdate", () => {
          setCurrentTime(audio.currentTime)
        })

        const playPromise = audio.play()
        await Promise.race([
          playPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
        ])

        setCurrentAudio(audio)
        setCurrentSurah(`${sheikh.name} - ${surah.name}`)
        setIsPlaying(true)
        audioPlayed = true
        console.log(`[v0] Successfully playing: ${audioUrl}`)

        audio.onended = () => {
          setIsPlaying(false)
          setCurrentSurah("")
          setShowSpotifyPlayer(false)
          setShowQuran(false)
        }

        audio.onerror = () => {
          console.log(`[v0] Audio error for: ${audioUrl}`)
        }

        break
      } catch (error) {
        console.log(`[v0] Playback error for ${audioUrl}:`, error)
        continue
      }
    }

    if (!audioPlayed) {
      setIsPlaying(false)
      setCurrentSurah("")
      setShowSpotifyPlayer(false)
      setShowQuran(false)
      console.log(`[v0] All audio sources failed for ${surah.name}`)
      alert(`عذراً، لا يمكن تشغيل سورة ${surah.name} للشيخ ${sheikh.name} حالياً. يرجى المحاولة لاحقاً.`)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setCurrentSurah("")
      setShowSpotifyPlayer(false)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const filteredSurahs = surahs.filter(
    (surah) => surah.name.includes(searchTerm) || surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredSheikhs = sheikhs.filter((sheikh) => sheikh.name.includes(searchTerm))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      {/* Spotify-style Header */}
      <header className="relative bg-gradient-to-r from-black via-gray-900 to-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-blue-900/50"></div>

        {/* Top Navigation */}
        <div className="relative z-10 flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              <span className="text-xl">🏠</span>
            </Link>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-xl">🎧</span>
            </div>
            <h1 className="text-2xl font-bold">القراء المشهورين</h1>
          </div>

          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
          >
            <span className="text-xl">{isDarkMode ? "☀️" : "🌙"}</span>
          </button>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <div className="text-7xl mb-6 animate-bounce">🎧</div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-green-400 to-purple-400 bg-clip-text text-transparent">
            القراء المشهورين
          </h1>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            استمع لأجمل التلاوات من أشهر قراء القرآن الكريم حول العالم
          </p>
        </div>
      </header>

      {/* Spotify-style Player */}
      {showSpotifyPlayer && currentPlayingSurah && currentPlayingSheikh && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-md">
            <button
              onClick={() => setShowSpotifyPlayer(false)}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">القرآن الكريم</h1>
            <button className="p-3 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>

          {/* Main Player Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 pb-32">
            {/* Album Art */}
            <div className="w-80 h-80 mb-8 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              {currentPlayingSheikh.image ? (
                <img
                  src={currentPlayingSheikh.image || "/placeholder.svg"}
                  alt={currentPlayingSheikh.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl text-white/80">🎧</div>
              )}
            </div>

            {/* Song Info */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-white mb-3">سورة {currentPlayingSurah.name}</h2>
              <p className="text-xl text-gray-300">{currentPlayingSheikh.name}</p>
              <p className="text-sm text-gray-400 mt-2">{currentPlayingSurah.numberOfAyahs} آية</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-lg mb-8">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="relative group">
                <div className="w-full h-1 bg-gray-600 rounded-full">
                  <div
                    className="h-1 bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 mb-8">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-colors ${
                  isFavorite ? "text-green-500" : "text-gray-400 hover:text-white"
                }`}
              >
                <svg
                  className="w-7 h-7"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              <button className="p-4 text-gray-400 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={togglePlayPause}
                className="w-20 h-20 bg-green-500 hover:bg-green-400 text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-2xl"
              >
                {isPlaying ? (
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button className="p-4 text-gray-400 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              <button className="p-3 text-gray-400 hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/30 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <button className="p-3 text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setShowQuran(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                </svg>
                <span className="font-medium">المصحف</span>
              </button>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sheikhs Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">🎧</span>
                القراء ({sheikhs.length})
              </h2>

              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="ابحث عن قارئ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors pr-12"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-400">جاري تحميل القراء...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredSheikhs.map((sheikh) => (
                    <button
                      key={sheikh.id}
                      onClick={() => setSelectedSheikh(sheikh)}
                      className={`w-full p-4 rounded-2xl text-right transition-all duration-300 ${
                        selectedSheikh?.id === sheikh.id
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl transform scale-105"
                          : "bg-white/5 hover:bg-white/10 text-white hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {sheikh.image ? (
                          <img
                            src={sheikh.image || "/placeholder.svg"}
                            alt={sheikh.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                          />
                        ) : (
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                              selectedSheikh?.id === sheikh.id ? "bg-white/20" : "bg-green-500 text-white"
                            }`}
                          >
                            {sheikh.letter || sheikh.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 text-right">
                          <div className="font-bold text-lg">{sheikh.name}</div>
                          <div className="text-sm opacity-75">{sheikh.rewaya || "حفص عن عاصم"}</div>
                        </div>
                      </div>
                      <div className="text-xs opacity-60 text-center">{sheikh.count || 114} سورة متاحة</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Surahs Grid */}
          <div className="lg:col-span-3">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              {selectedSheikh ? (
                <>
                  {/* Sheikh Header */}
                  <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedSheikh.name}</h2>
                      <p className="text-gray-300">{selectedSheikh.rewaya || "حفص عن عاصم"}</p>
                      <p className="text-sm text-gray-400">{selectedSheikh.count || 114} سورة متاحة</p>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                      💾 تحميل جميع التلاوات
                    </button>
                  </div>

                  {/* Search Surahs */}
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

                  {/* Surahs Grid */}
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {filteredSurahs.map((surah) => {
                      const recitationId = `${selectedSheikh.id}_${surah.number}`
                      const isDownloaded = downloadedRecitations.includes(recitationId)

                      return (
                        <div
                          key={surah.number}
                          className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 group hover:shadow-lg hover:transform hover:scale-105 border border-white/10"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold group-hover:text-green-400 transition-colors">{surah.name}</span>
                            <div className="flex items-center gap-2">
                              {isDownloaded && <span className="text-green-500 text-sm">💾</span>}
                              <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                {surah.number}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400 mb-2">{surah.englishName}</div>
                          <div className="text-xs text-gray-500 mb-3">{surah.numberOfAyahs} آية</div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => playAudio(selectedSheikh, surah)}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                              🎵 استمع
                            </button>
                            <button className="bg-green-500 hover:bg-green-400 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300">
                              💾
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="text-8xl mb-6 animate-bounce">🎧</div>
                  <h3 className="text-3xl font-bold mb-4">اختر قارئاً للاستماع</h3>
                  <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed mb-6">
                    اختر قارئاً من القائمة على اليسار لعرض تلاواته المتاحة وإمكانية تحميلها
                  </p>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 max-w-lg mx-auto">
                    <div className="text-4xl mb-3">👈</div>
                    <p className="text-green-400 font-semibold">انقر على اسم أي قارئ من القائمة لعرض السور المتاحة</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;700&display=swap');
        
        body {
          font-family: 'Tajawal', 'Amiri', sans-serif;
          direction: rtl;
        }
        
        .font-arabic {
          font-family: 'Amiri', serif;
          line-height: 2;
        }
        
        .dark-mode {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          color: #f1f5f9;
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-30px,0); }
          70% { transform: translate3d(0,-15px,0); }
          90% { transform: translate3d(0,-4px,0); }
        }

        /* Custom range slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-track {
          background: #374151;
          height: 4px;
          border-radius: 2px;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: #ffffff;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-track {
          background: #374151;
          height: 4px;
          border-radius: 2px;
          border: none;
        }

        input[type="range"]::-moz-range-thumb {
          background: #ffffff;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        /* Spotify-like slider styling */
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: #1db954;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .slider::-webkit-slider-track {
          background: #535353;
          height: 4px;
          border-radius: 2px;
        }
        
        .slider::-moz-range-thumb {
          background: #1db954;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        .slider::-moz-range-track {
          background: #535353;
          height: 4px;
          border-radius: 2px;
          border: none;
        }
      `}</style>
    </div>
  )
}
