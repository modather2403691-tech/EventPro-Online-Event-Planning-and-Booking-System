document.addEventListener("DOMContentLoaded", () => {
  const total = document.querySelector(".card:nth-child(1) p");
  const upcoming = document.querySelector(".card:nth-child(2) p");
  const completed = document.querySelector(".card:nth-child(3) p");

  if (total && upcoming && completed) {
    const totalBookings = 10;
    const upcomingBookings = 3;
    const completedBookings = 5;

    total.textContent = totalBookings;
    upcoming.textContent = upcomingBookings;
    completed.textContent = completedBookings;
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card p");

  if (cards.length >= 3) {
    const totalPackages = 20;
    const pendingRequests = 3;
    const upcomingEvents = 5;

    cards[0].textContent = totalPackages;
    cards[1].textContent = pendingRequests;
    cards[2].textContent = upcomingEvents;
  }
});