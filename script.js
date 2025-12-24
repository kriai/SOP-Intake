function toggleOtherInput(selectElement, inputId) {
  const otherInput = document.getElementById(inputId);
  if (!otherInput) return;

  if (selectElement.value === "Other") {
    otherInput.style.display = "block";
  } else {
    otherInput.style.display = "none";
    otherInput.value = "";
  }
}

function toggleCheckboxOther(checkbox, inputId) {
  const otherInput = document.getElementById(inputId);
  if (!otherInput) return;

  if (checkbox.checked) {
    otherInput.style.display = "block";
  } else {
    otherInput.style.display = "none";
    otherInput.value = "";
  }
}

function getCheckboxValues(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
  const values = Array.from(checkboxes).map((cb) => {
    if (cb.value === "Other") {
      const otherId = name + "Other";
      const otherInput = document.getElementById(otherId);
      return otherInput && otherInput.value ? `Other: ${otherInput.value}` : "Other";
    }
    return cb.value;
  });
  return values.join(", ");
}

function getSelectValue(name) {
  const select = document.querySelector(`select[name="${name}"]`);
  if (select && select.value === "Other") {
    const otherId = name + "Other";
    const otherInput = document.getElementById(otherId);
    return otherInput && otherInput.value ? `Other: ${otherInput.value}` : "Other";
  }
  return select ? select.value : "";
}

function sanitizeFilename(name) {
  return String(name || "")
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "-")
    .replace(/_+/g, "_")
    .replace(/^[_-]+|[_-]+$/g, "");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function valOrNA(value) {
  return value && String(value).trim() ? value : "N/A";
}

function currencyWithOther(selectName, otherId) {
  const selected = getSelectValue(selectName);
  if (selected && selected.startsWith("Other:")) return selected;

  if (selected === "Other") {
    const other = document.getElementById(otherId);
    return other && other.value.trim() ? `Other: ${other.value.trim()}` : "Other";
  }
  return selected || "";
}

/* --- Micro-interaction: ripple on button click --- */
function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();

  const ripple = document.createElement("span");
  ripple.className = "ripple";

  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;

  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

/* --- Playful-but-pro animation: scroll reveal --- */
function setupReveal() {
  const sections = document.querySelectorAll(".section");
  sections.forEach((s) => s.classList.add("reveal"));

  // If IntersectionObserver not supported, just show all
  if (!("IntersectionObserver" in window)) {
    sections.forEach((s) => s.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  sections.forEach((s) => io.observe(s));
}

/* --- Checkbox “checked” delight --- */
function setupCheckboxDelight() {
  const options = document.querySelectorAll(".option input[type='checkbox']");
  options.forEach((cb) => {
    cb.addEventListener("change", () => {
      const label = cb.closest(".option");
      if (!label) return;

      // Toggle class so CSS can animate the label
      if (cb.checked) {
        label.classList.remove("checked"); // restart animation
        // next frame re-add
        requestAnimationFrame(() => label.classList.add("checked"));
      } else {
        label.classList.remove("checked");
      }
    });
  });
}

function generateDownload() {
  const form = document.getElementById("sopForm");
  if (!form) return;

  const companyProjectName = form.companyProjectName?.value || "";
  const safeName = sanitizeFilename(companyProjectName) || "Unknown";
  const fileName = `SOP_${safeName}.txt`;

  const revenueCurrency = currencyWithOther("revenueCurrency", "revenueCurrencyOther");
  const marketCapCurrency = currencyWithOther("marketCapCurrency", "marketCapCurrencyOther");

  let content = "LEAN SOP FORM\n";
  content += "=".repeat(80) + "\n\n";

  content += `Company/Project name: ${valOrNA(companyProjectName)}\n\n`;

  content += "COMPANY DETAILS\n";
  content += "-".repeat(80) + "\n";
  content += `Headquartered in: ${valOrNA(form.hqIn?.value)}\n`;
  content += `Chairman: ${valOrNA(form.chairman?.value)}\n`;
  content += `CEO: ${valOrNA(form.ceo?.value)}\n`;

  const revVal = form.revenueValue?.value;
  content += `Revenue: ${valOrNA(revVal)} ${valOrNA(revenueCurrency)}\n`;

  const mcVal = form.marketCapValue?.value;
  content += `Market cap: ${valOrNA(mcVal)} ${valOrNA(marketCapCurrency)}\n`;

  content += `Client vertical: ${valOrNA(getSelectValue("vertical"))}\n`;
  content += `Employee headcount: ${valOrNA(form.employeeHeadcount?.value)}\n`;
  content += `Products and services: ${valOrNA(form.productsServices?.value)}\n`;
  content += `Product sales in more than _ countries: ${valOrNA(form.salesCountriesMoreThan?.value)}\n`;
  content += `Administrative presence in _ countries: ${valOrNA(form.adminCountries?.value)}\n`;
  content += `Manufacturing presence in _ countries: ${valOrNA(form.manufacturingCountries?.value)}\n`;
  content += `Operating HQ in _ countries: ${valOrNA(form.operatingHqCountries?.value)}\n`;
  content += `Geographic HQ in _ countries: ${valOrNA(form.geographicHqCountries?.value)}\n`;
  content += `Recent executive changes: ${valOrNA(form.recentExecChanges?.value)}\n\n`;

  content += "1) CASE OVERVIEW\n";
  content += "-".repeat(80) + "\n";
  content += `What did we deliver: ${valOrNA(form.delivery?.value)}\n`;
  content += `Primary solution domain: ${valOrNA(getSelectValue("primaryDomain"))}\n`;
  content += `Secondary domains: ${valOrNA(getCheckboxValues("secondaryDomains"))}\n`;
  content += `Buyer role: ${valOrNA(getSelectValue("buyer"))}\n`;
  content += `Primary users: ${valOrNA(getCheckboxValues("primaryUsers"))}\n\n`;

  content += "2) CLIENT PAIN POINTS + IMPLEMENTATION CHALLENGENGES\n";
  content += "-".repeat(80) + "\n";
  content += `Trigger (why now): ${valOrNA(getCheckboxValues("trigger"))}\n`;
  content += `Cost of pain: ${valOrNA(getCheckboxValues("costOfPain"))}\n`;
  content += `What did they try before: ${valOrNA(form.triedBefore?.value)}\n`;
  content += `Success definition: ${valOrNA(getSelectValue("successDef"))}\n`;
  content += `Target metric: ${valOrNA(form.targetMetric?.value)}\n\n`;

  content += "IMPLEMENTATION\n";
  content += "-".repeat(80) + "\n";
  content += `Top 3 blockers: ${valOrNA(getCheckboxValues("blockers"))}\n`;
  content += `What took most effort: ${valOrNA(getCheckboxValues("mostEffort"))}\n\n`;

  content += "3) BUSINESS IMPACT\n";
  content += "-".repeat(80) + "\n";
  content += `What changed: ${valOrNA(getCheckboxValues("whatChanged"))}\n`;
  content += `Impact type: ${valOrNA(getCheckboxValues("impactType"))}\n`;

  const m1b = form.metric1Before?.value;
  const m1a = form.metric1After?.value;
  const m2b = form.metric2Before?.value;
  const m2a = form.metric2After?.value;

  if ((m1b && m1b.trim()) || (m1a && m1a.trim())) {
    content += `Metric 1: ${valOrNA(m1b)} → ${valOrNA(m1a)}\n`;
  }
  if ((m2b && m2b.trim()) || (m2a && m2a.trim())) {
    content += `Metric 2: ${valOrNA(m2b)} → ${valOrNA(m2a)}\n`;
  }

  content += `Time-to-first-value: ${valOrNA(form.timeToValue?.value)}\n`;
  content += `Adoption at 30-90 days: ${valOrNA(form.adoption?.value)}\n\n`;

  content += "4) STRATEGY + SALES\n";
  content += "-".repeat(80) + "\n";
  content += `Why we won: ${valOrNA(getCheckboxValues("whyWon"))}\n`;
  content += `Objection: ${valOrNA(form.objection?.value)}\n`;
  content += `Response that worked: ${valOrNA(form.response?.value)}\n`;
  content += `Reusable asset created: ${valOrNA(getCheckboxValues("reusableAsset"))}\n`;
  content += `Reusability score: ${valOrNA(form.reusabilityScore?.value)}\n`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Downloaded: ${fileName}`);
}

function resetForm() {
  const form = document.getElementById("sopForm");
  if (!form) return;

  form.reset();

  const otherIds = [
    "verticalOther",
    "primaryDomainOther",
    "buyerOther",
    "successDefOther",
    "primaryUsersOther",
    "triggerOther",
    "costOfPainOther",
    "blockersOther",
    "whatChangedOther",
    "whyWonOther",
    "revenueCurrencyOther",
    "marketCapCurrencyOther",
  ];

  otherIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = "none";
    el.value = "";
  });

  // remove “checked” animation state
  document.querySelectorAll(".option.checked").forEach((x) => x.classList.remove("checked"));

  showToast("Form cleared.");
}

function setupCheckboxLimits() {
  // Trigger is unlimited by request.
  const limits = {
    secondaryDomains: 3,
    primaryUsers: 2,
    costOfPain: 3,
    blockers: 3,
    mostEffort: 2,
    whatChanged: 3,
    impactType: 3,
    whyWon: 2,
    reusableAsset: 2,
  };

  Object.entries(limits).forEach(([name, limit]) => {
    const boxes = document.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
    if (!boxes.length) return;

    boxes.forEach((cb) => {
      cb.addEventListener("change", function () {
        const checked = document.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`).length;
        if (checked > limit) {
          this.checked = false;
          const label = this.closest(".option");
          if (label) label.classList.remove("checked");
          showToast(`Select up to ${limit} options.`);
        }
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadBtn");
  const clearBtn = document.getElementById("clearBtn");

  downloadBtn?.addEventListener("click", generateDownload);
  clearBtn?.addEventListener("click", resetForm);

  // Ripple animations on buttons
  downloadBtn?.addEventListener("click", addRipple);
  clearBtn?.addEventListener("click", addRipple);

  setupCheckboxLimits();
  setupReveal();
  setupCheckboxDelight();
});
