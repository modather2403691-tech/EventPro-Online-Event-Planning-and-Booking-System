
(function () {
  const params = new URLSearchParams(window.location.search);
  const role = (params.get('role') || 'client').toLowerCase();

  const clientView = document.getElementById('client-profile-view');
  const organizerView = document.getElementById('organizer-profile-view');

  if (!clientView || !organizerView) return;

  if (role === 'organizer') {
    clientView.hidden = true;
    organizerView.hidden = false;
  } else {
    clientView.hidden = false;
    organizerView.hidden = true;
  }
})();
