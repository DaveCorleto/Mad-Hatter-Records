document.addEventListener("DOMContentLoaded", async () => {
  initFooterYear();
  initBackgroundSlideshow();
  initMobileMenu();
  await initContactLanguage();
  initContactForm();
});

let contactTranslations = {};

async function initContactLanguage() {
  const lang = localStorage.getItem("lang") || "en";

  try {
    const res = await fetch(`/lang/${lang}.json`);
    contactTranslations = await res.json();
  } catch {
    contactTranslations = {};
  }
}

function t(path, replacements = {}) {
  const value = path.split(".").reduce((obj, key) => obj?.[key], contactTranslations);

  if (!value) {
    return "";
  }

  return Object.entries(replacements).reduce((result, [key, replacement]) => {
    return result.replace(`{${key}}`, replacement);
  }, value);
}

function initFooterYear() {
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function initBackgroundSlideshow() {
  const images = [
    "images/hero1.webp",
    "images/hero2.webp",
    "images/hero3.webp"
  ];

  const bgLayer1 = document.querySelector(".site-bg__layer--1");
  const bgLayer2 = document.querySelector(".site-bg__layer--2");

  if (!bgLayer1 || !bgLayer2 || images.length === 0) {
    return;
  }

  let index = 0;
  let showingFirst = true;

  bgLayer1.style.backgroundImage = `url('${images[0]}')`;

  if (images.length > 1) {
    bgLayer2.style.backgroundImage = `url('${images[1]}')`;
  }

  setInterval(() => {
    index = (index + 1) % images.length;
    const nextImage = images[index];

    if (showingFirst) {
      bgLayer2.style.backgroundImage = `url('${nextImage}')`;
      bgLayer2.classList.add("is-active");
      bgLayer1.classList.remove("is-active");
    } else {
      bgLayer1.style.backgroundImage = `url('${nextImage}')`;
      bgLayer1.classList.add("is-active");
      bgLayer2.classList.remove("is-active");
    }

    showingFirst = !showingFirst;
  }, 6500);
}

function initMobileMenu() {
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileMenuLinks = document.querySelectorAll(".mobile-menu__link");
  const body = document.body;

  if (!navToggle || !mobileMenu) {
    return;
  }

  navToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");

    navToggle.classList.toggle("is-open");
    body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const button = document.getElementById("contact-submit");
  const successBox = document.getElementById("contact-success");
  const formLoadedAtField = document.getElementById("form-loaded-at");

  if (!form || !status || !button) {
    return;
  }

  const rateLimitSeconds = Number(form.dataset.rateLimitSeconds || 60);
  const minFillSeconds = Number(form.dataset.minFillSeconds || 4);
  const storageKey = "mad_hatter_contact_last_submit_at";
  const formLoadedAt = Date.now();

  let hideSuccessTimeoutId = null;
  let removeSuccessTimeoutId = null;

  if (formLoadedAtField) {
    formLoadedAtField.value = String(formLoadedAt);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus(status);

    const now = Date.now();
    const lastSubmitAt = Number(localStorage.getItem(storageKey) || 0);
    const secondsSinceLastSubmit = Math.floor((now - lastSubmitAt) / 1000);
    const secondsSinceLoad = Math.floor((now - formLoadedAt) / 1000);

    const formData = new FormData(form);

    const payload = {
      name: formData.get("name")?.toString().trim() || "",
      email: formData.get("email")?.toString().trim() || "",
      subject: formData.get("subject")?.toString().trim() || "",
      message: formData.get("message")?.toString().trim() || "",
      _gotcha: formData.get("_gotcha")?.toString().trim() || "",
      _subject: t("contactPage.form.emailSubject") || "New message from Mad Hatter Records"
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (payload._gotcha) {
      setErrorStatus(status, t("contactPage.form.blocked"));
      return;
    }

    if (secondsSinceLoad < minFillSeconds) {
      setErrorStatus(status, t("contactPage.form.tooFast"));
      return;
    }

    if (lastSubmitAt && secondsSinceLastSubmit < rateLimitSeconds) {
      const waitSeconds = rateLimitSeconds - secondsSinceLastSubmit;
      setErrorStatus(
        status,
        t("contactPage.form.waitBeforeNext", { seconds: String(waitSeconds) })
      );
      return;
    }

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setErrorStatus(status, t("contactPage.form.fillAllFields"));
      return;
    }

    if (!emailPattern.test(payload.email)) {
      setErrorStatus(status, t("contactPage.form.invalidEmail"));
      return;
    }

    if (payload.message.length < 10) {
      setErrorStatus(status, t("contactPage.form.messageTooShort"));
      return;
    }

    try {
      setSubmittingState(form, button, true);
      setNeutralStatus(status, t("contactPage.form.sendingStatus"));

      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      localStorage.setItem(storageKey, String(Date.now()));
      form.reset();
      clearStatus(status);

      if (successBox) {
        if (hideSuccessTimeoutId) {
          clearTimeout(hideSuccessTimeoutId);
        }

        if (removeSuccessTimeoutId) {
          clearTimeout(removeSuccessTimeoutId);
        }

        form.hidden = true;
        successBox.hidden = false;
        successBox.classList.remove("fade-out");

        hideSuccessTimeoutId = setTimeout(() => {
          successBox.classList.add("fade-out");

          removeSuccessTimeoutId = setTimeout(() => {
            successBox.hidden = true;
            successBox.classList.remove("fade-out");
            form.hidden = false;
          }, 800);
        }, 6000);
      } else {
        setNeutralStatus(status, t("contactPage.form.successStatus"));
      }
    } catch (error) {
      setErrorStatus(status, t("contactPage.form.errorStatus"));
    } finally {
      setSubmittingState(form, button, false);
    }
  });
}

function setSubmittingState(form, button, isSubmitting) {
  form.setAttribute("aria-busy", isSubmitting ? "true" : "false");
  button.disabled = isSubmitting;
  button.textContent = isSubmitting
    ? t("contactPage.form.sendingButton")
    : t("contactPage.form.submitButton");
}

function clearStatus(statusElement) {
  statusElement.textContent = "";
  statusElement.classList.remove("is-error");
}

function setNeutralStatus(statusElement, message) {
  statusElement.textContent = message;
  statusElement.classList.remove("is-error");
}

function setErrorStatus(statusElement, message) {
  statusElement.textContent = message;
  statusElement.classList.add("is-error");
}