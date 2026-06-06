// Injects Font Awesome icons into sidebar + navbar links by their href.
// Done in JS (real <i> elements) so it is immune to CSS specificity battles
// with the per-page stylesheets and needs no markup changes per page.
(function () {
  const ICONS = {
    '/client-index': 'fa-house',
    '/organizer-index': 'fa-house',
    '/admin-index': 'fa-house',
    '/client-dashboard': 'fa-gauge-high',
    '/organizer-dashboard': 'fa-gauge-high',
    '/admin-dashboard': 'fa-gauge-high',
    '/addevent': 'fa-calendar-plus',
    '/manage-events': 'fa-calendar-check',
    '/booking-requests': 'fa-inbox',
    '/accepted-requests': 'fa-circle-check',
    '/new-request': 'fa-square-plus',
    '/my-requests': 'fa-paper-plane',
    '/my-bookings': 'fa-ticket',
    '/packages': 'fa-box-open',
    '/client-profile': 'fa-user',
    '/organizer-profile': 'fa-user',
    '/manage-users': 'fa-users',
    '/client-reservation': 'fa-calendar-day',
    '/organizer-event': 'fa-calendar-days',
    '/reports': 'fa-chart-line',
    '/logout': 'fa-right-from-bracket',
    '/login': 'fa-right-to-bracket',
    '/register': 'fa-user-plus'
  };

  function iconFor(href) {
    if (!href) return null;
    const path = href.split('?')[0].split('#')[0];
    if (ICONS[path]) return ICONS[path];
    if (path.indexOf('/profile') === 0) return 'fa-user';
    return null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('.sidebar a, .home-nav-links a, .nav-links a');
    links.forEach(function (a) {
      if (a.querySelector('.nav-ic')) return; // already has one
      const ic = iconFor(a.getAttribute('href'));
      if (!ic) return;
      const i = document.createElement('i');
      i.className = 'fa-solid ' + ic + ' nav-ic';
      a.insertBefore(document.createTextNode(' '), a.firstChild);
      a.insertBefore(i, a.firstChild);
    });
  });
})();
