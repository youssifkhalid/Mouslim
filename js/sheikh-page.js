const surahs = [
  "الفاتحة",
  "البقرة",
  "آل عمران",
  "النساء",
  "المائدة",
  "الأنعام",
  "الأعراف",
  "الأنفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "إبراهيم",
  "الحجر",
  "النحل",
  "الإسراء",
  "الكهف",
  "مريم",
  "طه",
  "الأنبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",
  "السجدة",
  "الأحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الأحقاف",
  "محمد",
  "الفتح",
  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",
  "الطلاق",
  "التحريم",
  "الملك",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الإنسان",
  "المرسلات",
  "النبأ",
  "النازعات",
  "عبس",
  "التكوير",
  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الأعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",
  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قريش",
  "الماعون",
  "الكوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الإخلاص",
  "الفلق",
  "الناس",
]

let currentSheikh = null
let audioLinks = []
let currentVerses = []

// الحصول على معرف الشيخ من الرابط
function getSheikhIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get("id")
}

// تحميل بيانات الشيخ
async function loadSheikhData() {
  try {
    const response = await fetch("data/sheikhs.json")
    const data = await response.json()
    const sheikhId = getSheikhIdFromUrl()

    currentSheikh = data.sheikhs.find((sheikh) => sheikh.id === sheikhId)

    if (currentSheikh) {
      setupSheikhPage()
      generateAudioLinks()
    } else {
      // إعادة توجيه للصفحة الرئيسية إذا لم يتم العثور على الشيخ
      window.location.href = "index.html"
    }
  } catch (error) {
    console.error("خطأ في تحميل بيانات الشيخ:", error)
    window.location.href = "index.html"
  }
}

// إعداد صفحة الشيخ
function setupSheikhPage() {
  // تحديث عنوان الصفحة
  document.getElementById("page-title").textContent = `تلاوات ${currentSheikh.name}`
  document.getElementById("sheikh-title").textContent = `تلاوات ${currentSheikh.name}`
  document.getElementById("sheikh-subtitle").textContent = `استمع إلى تلاوات القرآن الكريم بصوت ${currentSheikh.name}`

  // عرض معلومات الشيخ
  const sheikhInfo = document.getElementById("sheikh-info")
  sheikhInfo.innerHTML = `
        <img src="${currentSheikh.image}" alt="${currentSheikh.name}" id="sheikhImage" onerror="this.src='https://via.placeholder.com/150x150/667eea/ffffff?text=قارئ'">
        <div class="sheikh-info-text">
            <h2>${currentSheikh.name}</h2>
            <p>${currentSheikh.description}</p>
        </div>
    `
}

// توليد روابط الصوت
function generateAudioLinks() {
  audioLinks = []
  for (let i = 1; i <= 114; i++) {
    const number = i.toString().padStart(3, "0")
    const link = `${currentSheikh.server}${number}.mp3`
    audioLinks.push(link)
  }
}

// إنشاء قائمة السور
function createSurahList() {
  const surahListElement = document.getElementById("surah-list")
  surahListElement.innerHTML = ""

  surahs.forEach((surah, index) => {
    const listItem = document.createElement("li")
    listItem.className = "surah-item"
    listItem.innerHTML = `
            <a href="#" data-surah-index="${index}">
                <span class="surah-number">${index + 1}</span>
                ${surah}
            </a>
        `
    surahListElement.appendChild(listItem)
  })
}

// تهيئة مشغل الصوت
function initializeAudioPlayer() {
  const surahList = document.getElementById("surah-list")
  const audioPlayer = document.getElementById("audio-player")
  const currentSurahElement = document.getElementById("current-surah")
  const searchInput = document.getElementById("search-input")
  const verseDisplay = document.getElementById("verse-display")

  surahList.addEventListener("click", (e) => {
    e.preventDefault()
    if (e.target.tagName === "A" || e.target.closest("a")) {
      const surahIndex = Number.parseInt(e.target.closest("a").getAttribute("data-surah-index"))
      playSurah(surahIndex)
    }
  })

  // وظيفة البحث
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase()
    const surahListItems = surahList.querySelectorAll(".surah-item")

    surahListItems.forEach((item, index) => {
      const surahName = surahs[index].toLowerCase()
      const surahNumber = (index + 1).toString()
      if (surahName.includes(searchTerm) || surahNumber.includes(searchTerm)) {
        item.style.display = ""
      } else {
        item.style.display = "none"
      }
    })
  })

  async function playSurah(index) {
    const audioSource = audioLinks[index]
    audioPlayer.src = audioSource
    audioPlayer.style.display = "block"
    currentSurahElement.textContent = `السورة الحالية: ${surahs[index]}`

    // إضافة تأثير التشغيل
    const surahItems = document.querySelectorAll(".surah-item")
    surahItems.forEach((item) => item.classList.remove("playing"))
    surahItems[index].classList.add("playing")

    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${index + 1}`)
      const data = await response.json()
      currentVerses = data.data.ayahs.map((ayah) => ayah.text)
      displayVerses(currentVerses)
      audioPlayer.play()
    } catch (error) {
      console.error("خطأ في تحميل الآيات:", error)
      verseDisplay.textContent = "عذرًا، حدث خطأ أثناء تحميل الآيات."
    }
  }

  function displayVerses(verses) {
    verseDisplay.innerHTML = ""
    verses.forEach((verse, index) => {
      const verseElement = document.createElement("div")
      verseElement.className = "verse"
      verseElement.innerHTML = `
                <span class="verse-number">${index + 1}</span>
                ${verse}
            `
      verseDisplay.appendChild(verseElement)
    })

    // إضافة أنيميشن للآيات
    const verseElements = verseDisplay.querySelectorAll(".verse")
    verseElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add("highlight")
        setTimeout(() => el.classList.remove("highlight"), 2000)
      }, index * 100)
    })
  }

  // إيقاف التأثير عند انتهاء التشغيل
  audioPlayer.addEventListener("ended", () => {
    document.querySelectorAll(".surah-item").forEach((item) => {
      item.classList.remove("playing")
    })
  })
}

// إعداد تبديل الثيم
function setupTheme() {
  const themeToggle = document.getElementById("themeToggle")
  const body = document.body

  function setTheme(theme) {
    if (theme === "dark") {
      body.classList.add("dark-mode")
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
    } else {
      body.classList.remove("dark-mode")
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
    }
  }

  function toggleTheme() {
    const currentTheme = localStorage.getItem("theme") || "light"
    const newTheme = currentTheme === "light" ? "dark" : "light"
    localStorage.setItem("theme", newTheme)
    setTheme(newTheme)
  }

  // تهيئة الثيم
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) {
    setTheme(savedTheme)
  }

  themeToggle.addEventListener("click", toggleTheme)
}

// إضافة أنيميشن للعناصر
function addFadeInAnimation() {
  const fadeElements = document.querySelectorAll(".fade-in")
  fadeElements.forEach((el, index) => {
    setTimeout(() => {
      el.style.opacity = "1"
      el.style.transform = "translateY(0)"
    }, index * 100)
  })
}

// تهيئة الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadSheikhData()
  createSurahList()
  initializeAudioPlayer()
  setupTheme()
})

window.addEventListener("load", addFadeInAnimation)
