document.addEventListener("DOMContentLoaded", () => {
  // 1. إنشاء الزرار العائم الشيك
  const toggleBtn = document.createElement("button");
  
  // 2. فحص الذاكرة للتأكد من المود الحالي
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
  
  const isDark = document.body.classList.contains("dark-mode");
  toggleBtn.innerHTML = isDark ? "☀️" : "🌙";
  
  // تصميم الزرار العائم
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 25px;
    right: 25px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: ${isDark ? "#ffffff" : "#1e1e1e"};
    color: ${isDark ? "#121212" : "#ffffff"};
    border: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    cursor: pointer;
    font-size: 24px;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  `;

  // أنيميشن عند التمرير بالماوس
  toggleBtn.onmouseover = () => toggleBtn.style.transform = "scale(1.1)";
  toggleBtn.onmouseout = () => toggleBtn.style.transform = "scale(1)";

  document.body.appendChild(toggleBtn);

  // 3. الأكشن لما اليوزر يدوس على الزرار
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const currentlyDark = document.body.classList.contains("dark-mode");
    
    // حفظ المود في الـ LocalStorage
    localStorage.setItem("theme", currentlyDark ? "dark" : "light");
    
    // تغيير شكل وألوان الزرار
    toggleBtn.innerHTML = currentlyDark ? "☀️" : "🌙";
    toggleBtn.style.backgroundColor = currentlyDark ? "#ffffff" : "#1e1e1e";
    toggleBtn.style.color = currentlyDark ? "#121212" : "#ffffff";
  });
});