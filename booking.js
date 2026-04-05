const basePrice = 500;
const services = document.querySelectorAll('.service');
const totalPrice = document.getElementById('totalPrice');

if (services.length > 0 && totalPrice) {
  services.forEach(service => {
    service.addEventListener('change', () => {
      let total = basePrice;

      services.forEach(item => {
        if (item.checked) {
          total += parseInt(item.value);
        }
      });

      totalPrice.textContent = total;
    });
  });
}