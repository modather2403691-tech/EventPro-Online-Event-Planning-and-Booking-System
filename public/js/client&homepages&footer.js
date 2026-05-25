document.addEventListener("DOMContentLoaded", () => {
    
    // ================= 1. كود القائمة الجانبية (Navbar Toggle) =================
    const nav = document.querySelector(".inner-navbar");
    const toggle = document.querySelector(".nav-toggle");

    // بنسأل الأول: هل زرار القائمة موجود في الصفحة دي؟ لو اه، شغله
    if (toggle && nav) {
        toggle.addEventListener("click", () => {
            nav.classList.toggle("open");
        });
    }

    // ================= 2. كود البحث والفلترة (Search & Filter) =================
    const searchInput = document.getElementById("eventSearch");
    const typeFilter = document.getElementById("typeFilter");

    // بنسأل الأول: هل شريط البحث موجود في الصفحة دي؟ لو اه، شغل الفلترة
    if (searchInput && typeFilter) {
        
        function filterEvents() {
            const searchVal = searchInput.value.toLowerCase();
            const typeVal = typeFilter.value.toLowerCase();
            const eventCards = document.querySelectorAll(".event-card");

            eventCards.forEach(card => {
                const h3 = card.querySelector("h3");
                if (!h3) return; // لو الكارت مفيهوش عنوان عدي الخطوة دي

                const title = h3.innerText.toLowerCase();
                const category = card.getAttribute("data-category") || "";

                const matchesSearch = title.includes(searchVal);
                const matchesType = (typeVal === "all" || category.toLowerCase() === typeVal);

                if (matchesSearch && matchesType) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        }

        // استخدام input أفضل من keyup عشان بتلقط النسخ واللصق كمان
        searchInput.addEventListener("input", filterEvents);
        typeFilter.addEventListener("change", filterEvents);
    }
});