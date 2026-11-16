// ========================================
// SECRET MESSAGE QR GENERATOR
// ========================================

// Get dashboard elements

const form = document.getElementById("messageForm");
const titleInput = document.getElementById("messageTitle");
const textInput = document.getElementById("messageText");

const qrList = document.getElementById("qrList");
const emptyState = document.getElementById("emptyState");
const messageCount = document.getElementById("messageCount");
const clearAllButton = document.getElementById("clearAll");


// ========================================
// CREATE UNIQUE MESSAGE LINK
// ========================================

function makeMessageUrl(title, message) {

  const payload = {
    t: title,
    m: message
  };

  const encoded = btoa(
    unescape(
      encodeURIComponent(JSON.stringify(payload))
    )
  );

  return window.location.href.split("#")[0] +
    "#note=" + encodeURIComponent(encoded);
}


// ========================================
// CREATE QR CARD
// ========================================

function makeQrCard(title, message) {

  if (typeof QRCode === "undefined") {
    alert("QR library not loaded. Check your internet connection.");
    return;
  }

  const card = document.createElement("article");
  card.className = "qr-card";

  const imageBox = document.createElement("div");
  imageBox.className = "qr-image";

  const details = document.createElement("div");
  details.className = "qr-details";

  const heading = document.createElement("h3");
  heading.textContent = title || "Untitled message";

  const description = document.createElement("p");

  description.textContent =
    message.length > 95
      ? message.slice(0, 95) + "..."
      : message;

  const actions = document.createElement("div");
  actions.className = "actions";


  // DOWNLOAD BUTTON

  const downloadButton = document.createElement("button");

  downloadButton.className = "small-button";
  downloadButton.type = "button";
  downloadButton.textContent = "Download PNG";


  // COPY LINK BUTTON

  const copyButton = document.createElement("button");

  copyButton.className = "small-button";
  copyButton.type = "button";
  copyButton.textContent = "Copy link";


  // GENERATE QR CODE

  new QRCode(imageBox, {

    text: makeMessageUrl(title, message),

    width: 280,
    height: 280,

    colorDark: "#000000",
    colorLight: "#ffffff",

    correctLevel: QRCode.CorrectLevel.H

  });


  // DOWNLOAD QR AS PNG

  downloadButton.addEventListener("click", () => {

    const canvas = imageBox.querySelector("canvas");
    const img = imageBox.querySelector("img");

    const dataUrl = canvas
      ? canvas.toDataURL("image/png")
      : (img ? img.src : null);

    if (!dataUrl) {
      alert("QR code is not ready yet.");
      return;
    }

    const link = document.createElement("a");

    link.href = dataUrl;

    link.download =
      safeFilename(title || "secret-message") + "-qr.png";

    link.click();

  });


  // COPY UNIQUE MESSAGE LINK

  copyButton.addEventListener("click", async () => {

    const url = makeMessageUrl(title, message);

    try {

      await navigator.clipboard.writeText(url);

      copyButton.textContent = "Copied!";

      setTimeout(() => {
        copyButton.textContent = "Copy link";
      }, 1400);

    } catch {

      prompt("Copy this message link:", url);

    }

  });


  actions.append(downloadButton, copyButton);

  details.append(heading, description, actions);

  card.append(imageBox, details);

  qrList.prepend(card);

  updateCount();

}


// ========================================
// CLEAN FILE NAMES
// ========================================

function safeFilename(value) {

  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "message";

}


// ========================================
// UPDATE QR COUNT
// ========================================

function updateCount() {

  const count = qrList.children.length;

  messageCount.textContent = `${count} created`;

  emptyState.hidden = count > 0;

}


// ========================================
// GENERATE NEW QR
// ========================================

form.addEventListener("submit", (event) => {

  event.preventDefault();

  const message = textInput.value.trim();

  const title =
    titleInput.value.trim() || "A little secret";

  if (!message) {

    textInput.focus();

    return;

  }

  // Keep messages short enough for reliable QR generation.
  if (message.length > 200) {

    alert("Please keep your message within 200 characters.");

    return;

  }

  makeQrCard(title, message);

  form.reset();

  textInput.focus();

});


// ========================================
// CLEAR DASHBOARD
// ========================================

clearAllButton.addEventListener("click", () => {

  if (!qrList.children.length) return;

  const confirmed = confirm(
    "Clear all QR codes from this dashboard?"
  );

  if (confirmed) {

    qrList.replaceChildren();

    updateCount();

  }

});


// ========================================
// DISPLAY MESSAGE AFTER QR SCAN
// ========================================

function showMessageFromHash() {

  const match = window.location.hash.match(/^#note=(.+)$/);

  if (!match) return false;

  try {

    const json = decodeURIComponent(
      escape(
        atob(decodeURIComponent(match[1]))
      )
    );

    const payload = JSON.parse(json);

    if (
      typeof payload.m !== "string" ||
      !payload.m
    ) {
      return false;
    }


    // Hide dashboard

    document.getElementById("generatorView").hidden = true;


    // Show message page

    const viewer = document.getElementById("messageView");

    viewer.hidden = false;


    // Display heading

    document.getElementById("viewerTitle").textContent =
      payload.t || "A little secret is waiting for you.";


    // Reveal button action

    document.getElementById("revealButton")
      .addEventListener("click", () => {

        const messageBox =
          document.getElementById("revealedMessage");

        messageBox.textContent = payload.m;

        messageBox.hidden = false;

        document.getElementById("revealButton").hidden = true;

      }, { once: true });


    return true;

  } catch (error) {

    console.error("Unable to read message:", error);

    return false;

  }

}


// ========================================
// INITIALIZE WEBSITE
// ========================================

if (!showMessageFromHash()) {

  document.getElementById("generatorView").hidden = false;

  updateCount();

}
