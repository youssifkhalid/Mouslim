let sheikhsData = []

// تحميل بيانات الشيوخ
async function loadSheikhs() {
  try {
    const response = await fetch("data/sheikhs.json")
    const data = await response.json()
    sheikhsData = data.sheikhs
    displaySheikhs(sheikhsData)
  } catch (error) {
    console.error("خطأ في تحميل بيانات الشيوخ:", error)
  }
}

// عرض الشيوخ في الشبكة
function displaySheikhs(sheikhs) {
  const sheikhsGrid = document.getElementById("sheikhs-grid")
  sheikhsGrid.innerHTML = ""

  sheikhs.forEach((sheikh) => {
    const sheikhCard = document.createElement("a")
    sheikhCard.href = `sheikh.html?id=${sheikh.id}`
    sheikhCard.className = "sheikh-card"
    sheikhCard.innerHTML = `
            <img src="${sheikh.image}" alt="${sheikh.name}" onerror="this.src='https://via.placeholder.com/120x120/667eea/ffffff?text=قارئ'">
            <h3>${sheikh.name}</h3>
            <p>${sheikh.description}</p>
        `
    sheikhsGrid.appendChild(sheikhCard)
  })
}

// وظيفة البحث
function setupSearch() {
  const searchInput = document.getElementById("search-input")
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase()
    const filteredSheikhs = sheikhsData.filter(
      (sheikh) =>
        sheikh.name.toLowerCase().includes(searchTerm) || sheikh.description.toLowerCase().includes(searchTerm),
    )
    displaySheikhs(filteredSheikhs)
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
  loadSheikhs()
  setupSearch()
  setupTheme()
})

window.addEventListener("load", addFadeInAnimation)
