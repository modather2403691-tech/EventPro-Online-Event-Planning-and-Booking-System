// session.js — saves and restores the logged-in user's name across pages

(function () {
  // If the URL has ?name=, save it to localStorage
  const params = new URLSearchParams(window.location.search);
  const nameFromUrl = params.get('name');

  if (nameFromUrl) {
    localStorage.setItem('userName', decodeURIComponent(nameFromUrl));
  }

  // Replace every element with data-username with the stored name
  const storedName = localStorage.getItem('userName');

  if (storedName) {
    document.querySelectorAll('[data-username]').forEach(el => {
      el.textContent = storedName;
    });
  }
})();
