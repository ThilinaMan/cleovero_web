const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
const navbar = document.getElementById("navbar");

const quoteForm = document.getElementById("quoteForm");
const serviceEl = document.getElementById("service");
const propertyEl = document.getElementById("property");
const frequencyEl = document.getElementById("frequency");
const dateEl = document.getElementById("date");
const postcodeEl = document.getElementById("postcode");
const phoneEl = document.getElementById("phone");
const ecoEl = document.getElementById("eco");
const ovenEl = document.getElementById("insideOven");

const priceValue = document.getElementById("priceValue");
const priceHint = document.getElementById("priceHint");
const durationPill = document.getElementById("durationPill");
const instantStatus = document.getElementById("instantStatus");

const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastBody = document.getElementById("toastBody");

const yearEl = document.getElementById("year");
const presetButtons = document.querySelectorAll("[data-preset]");

const pricingMap = {
  standard: {
    studio: { price: 59, hours: 2 },
    "1bed": { price: 69, hours: 2.5 },
    "2bed": { price: 85, hours: 3 },
    "3bed": { price: 105, hours: 4 },
    "4bed": { price: 129, hours: 5 }
  },
  deep: {
    studio: { price: 109, hours: 3.5 },
    "1bed": { price: 129, hours: 4 },
    "2bed": { price: 155, hours: 5 },
    "3bed": { price: 189, hours: 6 },
    "4bed": { price: 229, hours: 7 }
  },
  end: {
    studio: { price: 149, hours: 4 },
    "1bed": { price: 175, hours: 5 },
    "2bed": { price: 215, hours: 6 },
    "3bed": { price: 259, hours: 7 },
    "4bed": { price: 309, hours: 8 }
  },
  office: {
    studio: { price: 89, hours: 2.5 },
    "1bed": { price: 109, hours: 3 },
    "2bed": { price: 139, hours: 4 },
    "3bed": { price: 179, hours: 5 },
    "4bed": { price: 229, hours: 6 }
  }
};

const frequencyDiscounts = {
  once: 0,
  weekly: 0.10,
  biweekly: 0.07,
  monthly: 0.05
};

function formatCurrency(value) {
  return `£${value.toFixed(0)}`;
}

function setTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const current = `${yyyy}-${mm}-${dd}`;
  dateEl.min = current;
  if (!dateEl.value) dateEl.value = current;
}

function validatePostcode(postcode) {
  return /^([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i.test(postcode.trim());
}

function validatePhone(phone) {
  const cleaned = phone.replace(/\s+/g, "");
  return /^(\+44|0)7\d{9}$/.test(cleaned);
}

function calculateQuote() {
  const service = serviceEl.value;
  const property = propertyEl.value;
  const frequency = frequencyEl.value;

  const base = pricingMap[service]?.[property];
  if (!base) {
    priceValue.textContent = "£—";
    durationPill.textContent = "~— hrs";
    priceHint.textContent = "Select options to see estimate.";
    return;
  }

  let price = base.price;
  let hours = base.hours;

  if (ecoEl.checked) price += 8;
  if (ovenEl.checked) {
    price += 25;
    hours += 1;
  }

  const discount = frequencyDiscounts[frequency] || 0;
  const finalPrice = price - price * discount;

  priceValue.textContent = formatCurrency(finalPrice);
  durationPill.textContent = `~${hours} hrs`;
  priceHint.textContent = discount > 0
    ? `${Math.round(discount * 100)}% repeat booking discount applied.`
    : "One-time cleaning estimate.";
  instantStatus.textContent = "Estimate updated";
}

function showToast(title, body) {
  toastTitle.textContent = title;
  toastBody.textContent = body;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function handleSubmit(e) {
  e.preventDefault();

  if (!validatePostcode(postcodeEl.value)) {
    showToast("Check postcode", "Please enter a valid UK postcode.");
    postcodeEl.focus();
    return;
  }

  if (!validatePhone(phoneEl.value)) {
    showToast("Check phone number", "Please enter a valid UK mobile number.");
    phoneEl.focus();
    return;
  }

  calculateQuote();
  showToast("Booking request received", "Thanks! Your request has been captured.");
  quoteForm.reset();
  setTodayDate();
  calculateQuote();
}

function setupPresets() {
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.dataset.preset;
      if (preset) {
        serviceEl.value = preset;
        calculateQuote();
      }
    });
  });
}

function setupMobileMenu() {
  burgerBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("show");
    });
  });
}

function setupNavbarScroll() {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((item) => observer.observe(item));
}

function setupParallax() {
  const hero = document.querySelector(".hero-bg");
  const reviews = document.querySelector(".reviews-bg");

  window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset;
    if (hero) hero.style.backgroundPosition = `center ${scrollY * 0.35}px`;
    if (reviews) reviews.style.backgroundPosition = `center ${scrollY * 0.15}px`;
  });
}

function initYear() {
  yearEl.textContent = new Date().getFullYear();
}

function bindInputs() {
  [serviceEl, propertyEl, frequencyEl, ecoEl, ovenEl, dateEl].forEach((el) => {
    el.addEventListener("input", calculateQuote);
    el.addEventListener("change", calculateQuote);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  setTodayDate();
  calculateQuote();
  bindInputs();
  setupMobileMenu();
  setupNavbarScroll();
  setupReveal();
  setupPresets();
  setupParallax();

  quoteForm.addEventListener("submit", handleSubmit);
});