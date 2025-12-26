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

function valOrBlank(value) {
  return value && String(value).trim() ? String(value).trim() : "";
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

/* --- CSV helpers --- */
function csvEscape(value) {
  const s = String(value ?? "");
  // escape quotes by doubling them
  const escaped = s.replace(/"/g, '""');
  // wrap in quotes if it contains comma, quote, or newline
  if (/[",\n\r]/.test(escaped)) return `"${escaped}"`;
  return escaped;
}

function buildCsvRow(key, value) {
  return `${csvEscape(key)},${csvEscape(value)}`;
}

function buildCsv(rows) {
  // header row
  const header = "Field,Value";
  return [header, ...rows].join("\n");
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

/* --- Scroll reveal --- */
function setupReveal() {
  const sections = document.querySelectorAll(".section");
  sections.forEach((s) => s.classList.add("reveal"));

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

      if (cb.checked) {
        label.classList.remove("checked");
        requestAnimationFrame(() => label.classList.add("checked"));
      } else {
        label.classList.remove("checked");
      }
    });
  });
}

function generateDownloadCSV() {
  const form = document.getElementById("sopForm");
  if (!form) return;

  const companyProjectName = form.companyProjectName?.value || "";
  const safeName = sanitizeFilename(companyProjectName) || "Unknown";
  const fileName = `SOP_${safeName}.csv`;

  const revenueCurrency = currencyWithOther("revenueCurrency", "revenueCurrencyOther");
  const marketCapCurrency = currencyWithOther("marketCapCurrency", "marketCapCurrencyOther");

  const rows = [];

  // Company / Project
  rows.push(buildCsvRow("Company/Project name", valOrBlank(companyProjectName)));

  // Company Details
  rows.push(buildCsvRow("Headquartered in", valOrBlank(form.hqIn?.value)));
  rows.push(buildCsvRow("Chairman", valOrBlank(form.chairman?.value)));
  rows.push(buildCsvRow("CEO", valOrBlank(form.ceo?.value)));

  rows.push(buildCsvRow("Revenue value", valOrBlank(form.revenueValue?.value)));
  rows.push(buildCsvRow("Revenue currency", valOrBlank(revenueCurrency)));

  rows.push(buildCsvRow("Market cap value", valOrBlank(form.marketCapValue?.value)));
  rows.push(buildCsvRow("Market cap currency", valOrBlank(marketCapCurrency)));

  rows.push(buildCsvRow("Client vertical", valOrBlank(getSelectValue("vertical"))));
  rows.push(buildCsvRow("Employee headcount", valOrBlank(form.employeeHeadcount?.value)));
  rows.push(buildCsvRow("Products and services", valOrBlank(form.productsServices?.value)));

  rows.push(buildCsvRow("Product sales in more than _ countries", valOrBlank(form.salesCountriesMoreThan?.value)));
  rows.push(buildCsvRow("Administrative presence in _ countries", valOrBlank(form.adminCountries?.value)));
  rows.push(buildCsvRow("Manufacturing presence in _ countries", valOrBlank(form.manufacturingCountries?.value)));
  rows.push(buildCsvRow("Operating HQ in _ countries", valOrBlank(form.operatingHqCountries?.value)));
  rows.push(buildCsvRow("Geographic HQ in _ countries", valOrBlank(form.geographicHqCountries?.value)));
  rows.push(buildCsvRow("Recent executive changes", valOrBlank(form.recentExecChanges?.value)));

  // 1) Case Overview
  rows.push(buildCsvRow("What did we deliver", valOrBlank(form.delivery?.value)));
  rows.push(buildCsvRow("Primary solution domain", valOrBlank(getSelectValue("primaryDomain"))));
  rows.push(buildCsvRow("Secondary domains", valOrBlank(getCheckboxValues("secondaryDomains"))));
  rows.push(buildCsvRow("Buyer role", valOrBlank(getSelectValue("buyer"))));
  rows.push(buildCsvRow("Primary users", valOrBlank(getCheckboxValues("primaryUsers"))));

  // 2) Pain Points
  rows.push(buildCsvRow("Trigger (why now)", valOrBlank(getCheckboxValues("trigger"))));
  rows.push(buildCsvRow("Cost of pain", valOrBlank(getCheckboxValues("costOfPain"))));
  rows.push(buildCsvRow("What did they try before", valOrBlank(form.triedBefore?.value)));
  rows.push(buildCsvRow("Success definition", valOrBlank(getSelectValue("successDef"))));
  rows.push(buildCsvRow("Target metric", valOrBlank(form.targetMetric?.value)));

  // Implementation
  rows.push(buildCsvRow("Top 3 blockers", valOrBlank(getCheckboxValues("blockers"))));
  rows.push(buildCsvRow("What took most effort", valOrBlank(getCheckboxValues("mostEffort"))));

  // 3) Business Impact
  rows.push(buildCsvRow("What changed", valOrBlank(getCheckboxValues("whatChanged"))));
  rows.push(buildCsvRow("Impact type", valOrBlank(getCheckboxValues("impactType"))));
  rows.push(buildCsvRow("Metric 1 - Before", valOrBlank(form.metric1Before?.value)));
  rows.push(buildCsvRow("Metric 1 - After", valOrBlank(form.metric1After?.value)));
  rows.push(buildCsvRow("Metric 2 - Before", valOrBlank(form.metric2Before?.value)));
  rows.push(buildCsvRow("Metric 2 - After", valOrBlank(form.metric2After?.value)));
  rows.push(buildCsvRow("Time-to-first-value", valOrBlank(form.timeToValue?.value)));
  rows.push(buildCsvRow("Adoption at 30–90 days", valOrBlank(form.adoption?.value)));

  // 4) Strategy + Sales
  rows.push(buildCsvRow("Why we won", valOrBlank(getCheckboxValues("whyWon"))));
  rows.push(buildCsvRow("Objection", valOrBlank(form.objection?.value)));
  rows.push(buildCsvRow("Response that worked", valOrBlank(form.response?.value)));
  rows.push(buildCsvRow("Reusable asset created", valOrBlank(getCheckboxValues("reusableAsset"))));
  rows.push(buildCsvRow("Reusability score", valOrBlank(form.reusabilityScore?.value)));

  const csv = buildCsv(rows);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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

  downloadBtn?.addEventListener("click", generateDownloadCSV);
  clearBtn?.addEventListener("click", resetForm);

  // Ripple animations
  downloadBtn?.addEventListener("click", addRipple);
  clearBtn?.addEventListener("click", addRipple);

  setupCheckboxLimits();
  setupReveal();
  setupCheckboxDelight();
});
