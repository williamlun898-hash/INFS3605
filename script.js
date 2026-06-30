const screens = Array.from(document.querySelectorAll(".screen"));
const navItems = Array.from(document.querySelectorAll(".nav-item"));
const floatingAction = document.querySelector("#ask-referral");
const resetButton = document.querySelector("#reset-demo");
const sendReferralButton = document.querySelector("#send-referral");
const clinicSearch = document.querySelector("#clinic-search");
const clinicCards = Array.from(document.querySelectorAll(".clinic-card"));
const clinicPins = Array.from(document.querySelectorAll(".map-pin"));
const selectedClinicName = document.querySelector("#selected-clinic-name");
const selectedClinicPhone = document.querySelector("#selected-clinic-phone");
const confirmationClinic = document.querySelector("#confirmation-clinic");
const requestTime = document.querySelector("#request-time");
const storageKey = "kams-week5-fh-referral-request";
const clinics = {
  singhealth: {
    name: "SingHealth Polyclinic - Bedok",
    phone: "6643 6969",
  },
  tampines: {
    name: "Tampines Family Clinic",
    phone: "6781 2288",
  },
  eastcare: {
    name: "EastCare GP Group",
    phone: "6447 3344",
  },
};
let selectedClinicId = "singhealth";

function activeScreenName() {
  const active = document.querySelector(".screen.active");
  return active ? active.dataset.screen : "home";
}

function updateFloatingAction(screenName) {
  const visible = screenName === "results" || screenName === "brochure";
  floatingAction.classList.toggle("visible", visible);
}

function updateNavigation(screenName) {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.go === screenName);
  });
}

function showScreen(screenName) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === screenName);
  });
  updateFloatingAction(screenName);
  updateNavigation(screenName);
}

function selectClinic(clinicId) {
  if (!clinics[clinicId]) return;
  selectedClinicId = clinicId;

  clinicCards.forEach((card) => {
    card.classList.toggle("selected", card.dataset.clinic === clinicId);
  });
  clinicPins.forEach((pin) => {
    pin.classList.toggle("selected", pin.dataset.clinic === clinicId);
  });

  selectedClinicName.textContent = clinics[clinicId].name;
  selectedClinicPhone.textContent = clinics[clinicId].phone;
}

function filterClinics(query) {
  const normalized = query.trim().toLowerCase();
  clinicCards.forEach((card) => {
    const clinic = clinics[card.dataset.clinic];
    const visible =
      !normalized ||
      clinic.name.toLowerCase().includes(normalized) ||
      clinic.phone.toLowerCase().includes(normalized);
    card.hidden = !visible;
  });
}

function saveReferralRequest() {
  const now = new Date();
  const clinic = clinics[selectedClinicId];
  const request = {
    patient: "Amina Tan",
    source: "Existing SingHealth lipid panel record",
    rule: "LDL-C red zone: 5.5+ mmol/L",
    ldl: "Red zone",
    clinic: clinic.name,
    phone: clinic.phone,
    action: "Send request to selected GP",
    status: "Submitted for GP clinical review",
    timeLabel: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  localStorage.setItem(storageKey, JSON.stringify(request));
  requestTime.textContent = request.timeLabel;
  confirmationClinic.textContent = clinic.name;
  floatingAction.textContent = "View referral request";
  showScreen("confirmation");
}

function restoreReferralState() {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
  if (!saved) return;

  requestTime.textContent = saved.timeLabel || "Today";
  if (saved.clinic) confirmationClinic.textContent = saved.clinic;
  floatingAction.textContent = "View referral request";
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-go]");
  if (!target) return;

  showScreen(target.dataset.go);
});

floatingAction.addEventListener("click", () => {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    showScreen("confirmation");
    return;
  }
  showScreen("clinic");
});

clinicCards.forEach((card) => {
  card.addEventListener("click", () => selectClinic(card.dataset.clinic));
});

clinicPins.forEach((pin) => {
  pin.addEventListener("click", () => selectClinic(pin.dataset.clinic));
});

clinicSearch.addEventListener("input", () => filterClinics(clinicSearch.value));

sendReferralButton.addEventListener("click", saveReferralRequest);

resetButton.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  floatingAction.textContent = "Ask GP for referral";
  clinicSearch.value = "";
  filterClinics("");
  selectClinic("singhealth");
  showScreen("home");
});

selectClinic(selectedClinicId);
restoreReferralState();
updateFloatingAction(activeScreenName());
