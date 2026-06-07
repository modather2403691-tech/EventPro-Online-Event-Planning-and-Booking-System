document.addEventListener("DOMContentLoaded", () => {
    
    
    const nav = document.querySelector(".inner-navbar");
    const toggle = document.querySelector(".nav-toggle");

   
    if (toggle && nav) {
        toggle.addEventListener("click", () => {
            nav.classList.toggle("open");
        });
    }


    const searchInput = document.getElementById("eventSearch");
    const typeFilter = document.getElementById("typeFilter");

   
    if (searchInput && typeFilter) {
        
        function filterEvents() {
            const searchVal = searchInput.value.toLowerCase();
            const typeVal = typeFilter.value.toLowerCase();
            const eventCards = document.querySelectorAll(".event-card");

            eventCards.forEach(card => {
                const h3 = card.querySelector("h3");
                if (!h3) return; 

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

        
        searchInput.addEventListener("input", filterEvents);
        typeFilter.addEventListener("change", filterEvents);
    }
});