
    // ---------- helpers ----------
    const $ = (sel) => document.querySelector(sel);

    function showToast(title, body){
      const toast = $("#toast");
      $("#toastTitle").textContent = title;
      $("#toastBody").textContent = body;
      toast.classList.add("show");
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => toast.classList.remove("show"), 3200);
    }

    function smoothCloseMobileMenu(){
      const mobile = $("#mobileMenu");
      mobile.classList.remove("show");
    }

    // ---------- mobile menu ----------
    const burgerBtn = $("#burgerBtn");
    const mobileMenu = $("#mobileMenu");

    burgerBtn?.addEventListener("click", () => {
      mobileMenu.classList.toggle("show");
    });

    mobileMenu?.addEventListener("click", (e) => {
      if(e.target.tagName.toLowerCase() === "a") smoothCloseMobileMenu();
    });

    // ---------- preset buttons ----------
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-preset]");
      if(!a) return;
      const preset = a.getAttribute("data-preset");
      const service = $("#service");
      if(preset === "standard") service.value = "standard";
      if(preset === "deep") service.value = "deep";
      if(preset === "end") service.value = "end";
      computeEstimate();
    });

    // ---------- quote estimator ----------
    const serviceEl = $("#service");
    const propertyEl = $("#property");
    const frequencyEl = $("#frequency");
    const dateEl = $("#date");
    const ecoEl = $("#eco");
    const ovenEl = $("#insideOven");
    const postcodeEl = $("#postcode");
    const phoneEl = $("#phone");

    // default date = tomorrow (local)
    (function initDate(){
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const iso = d.toISOString().slice(0,10);
      dateEl.value = iso;
      $("#year").textContent = new Date().getFullYear();
    })();

    function isValidUKPostcode(p){
      // Simple demo-level UK postcode regex (not perfect but good enough for landing page)
      const re = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/i;
      return re.test((p||"").trim());
    }

    function isValidPhone(p){
      // Simple UK mobile-ish validation (demo)
      const digits = (p||"").replace(/\D/g,"");
      return digits.length >= 10 && digits.length <= 12;
    }

    function computeEstimate(){
      const service = serviceEl.value;
      const property = propertyEl.value;
      const freq = frequencyEl.value;
      const eco = ecoEl.checked;
      const oven = ovenEl.checked;

      // Base by service
      const serviceBase = {
        standard: 45,
        deep: 85,
        end: 120,
        office: 75
      }[service] ?? 45;

      // Size multiplier
      const size = {
        studio: 1.0,
        "1bed": 1.2,
        "2bed": 1.45,
        "3bed": 1.75,
        "4bed": 2.1
      }[property] ?? 1.0;

      // Frequency discounts
      const discount = {
        once: 0.00,
        weekly: 0.10,
        biweekly: 0.07,
        monthly: 0.05
      }[freq] ?? 0.00;

      // Add-ons
      const ecoFee = eco ? 6 : 0;
      const ovenFee = oven ? 18 : 0;

      let price = (serviceBase * size) + ecoFee + ovenFee;
      price = price * (1 - discount);

      // duration estimate
      const baseHours = {
        standard: 2.0,
        deep: 3.5,
        end: 4.5,
        office: 3.0
      }[service] ?? 2.0;

      const hours = Math.max(1.5, baseHours * (size * 0.95));
      const hoursRounded = Math.round(hours * 2) / 2;

      $("#priceValue").textContent = "£" + Math.round(price);
      $("#durationPill").textContent = "~" + hoursRounded + " hrs";

      // Hint text
      const freqText = {
        once: "One-time booking",
        weekly: "Weekly discount applied",
        biweekly: "Bi-weekly discount applied",
        monthly: "Monthly discount applied"
      }[freq];

      $("#priceHint").textContent = `${freqText}${eco ? " • Eco products" : ""}${oven ? " • Oven included" : ""}`;

      // Live estimate pill
      $("#instantStatus").textContent = "Updated";
      clearTimeout(computeEstimate._t);
      computeEstimate._t = setTimeout(() => $("#instantStatus").textContent = "Live estimate", 900);
    }

    [serviceEl, propertyEl, frequencyEl, ecoEl, ovenEl].forEach(el => {
      el.addEventListener("change", computeEstimate);
      el.addEventListener("input", computeEstimate);
    });

    computeEstimate();

    // ---------- form submit ----------
    $("#quoteForm").addEventListener("submit", (e) => {
      e.preventDefault();

      const postcode = postcodeEl.value.trim();
      const phone = phoneEl.value.trim();

      const postcodeOk = isValidUKPostcode(postcode);
      const phoneOk = isValidPhone(phone);

      if(!postcodeOk){
        postcodeEl.focus();
        showToast("Check your postcode", "Please enter a valid UK postcode (e.g., TW3 1AA).");
        return;
      }
      if(!phoneOk){
        phoneEl.focus();
        showToast("Check your phone number", "Please enter a valid UK phone number.");
        return;
      }

      // Create a booking summary (demo)
      const summary = {
        service: serviceEl.options[serviceEl.selectedIndex].text,
        property: propertyEl.options[propertyEl.selectedIndex].text,
        frequency: frequencyEl.options[frequencyEl.selectedIndex].text,
        date: dateEl.value,
        eco: ecoEl.checked ? "Yes" : "No",
        oven: ovenEl.checked ? "Yes" : "No",
        postcode,
        phone,
        price: $("#priceValue").textContent,
        duration: $("#durationPill").textContent,
        notes: $("#notes").value.trim()
      };

      // Save demo request locally (no server)
      const key = "cleovoro_demo_requests";
      const old = JSON.parse(localStorage.getItem(key) || "[]");
      old.unshift({ ...summary, createdAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(old.slice(0, 25)));

      showToast("Booking request saved (demo)", "We’ll contact you shortly to confirm your slot.");

      // Optional: reset notes only
      $("#notes").value = "";
    });

    // ---------- smooth anchor scrolling ----------
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if(!link) return;
      const id = link.getAttribute("href");
      if(id.length <= 1) return;

      const target = document.querySelector(id);
      if(!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
    });