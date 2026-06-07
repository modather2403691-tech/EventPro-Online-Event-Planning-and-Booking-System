

(function () {
 
  const params = new URLSearchParams(window.location.search);
  const nameFromUrl = params.get('name');

  if (nameFromUrl) {
    localStorage.setItem('userName', decodeURIComponent(nameFromUrl));
  }

  
  const storedName = localStorage.getItem('userName');

  if (storedName) {
    document.querySelectorAll('[data-username]').forEach(el => {
      el.textContent = storedName;
    });
  }
})();
