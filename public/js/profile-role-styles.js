(function () {
  var role = new URLSearchParams(window.location.search).get("role");
  var normalizedRole = (role || "client").toLowerCase();
  var roleStyles = document.createElement("link");

  roleStyles.rel = "stylesheet";
  roleStyles.href = normalizedRole === "organizer" ? "css/organizer.css" : "css/client&homepages&footer.css";

  document.head.appendChild(roleStyles);
})();
// Profile page script
document.addEventListener("DOMContentLoaded", function () {
  var role = new URLSearchParams(window.location.search).get("role");
  var isOrganizer = (role || "").toLowerCase() === "organizer";
  var clientView = document.getElementById("client-profile-view");
  var organizerView = document.getElementById("organizer-profile-view");

  if (!clientView || !organizerView) {
    return;
  }

  clientView.hidden = isOrganizer;
  organizerView.hidden = !isOrganizer;
  document.title = isOrganizer ? "EventPro - Organizer Profile" : "EventPro - Profile";
});