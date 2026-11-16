// =====================================
// BACTOLAC R&D MESSAGE VIEWER
// =====================================

const title = document.getElementById("viewerTitle");

const revealButton =
  document.getElementById("revealButton");

const messageBox =
  document.getElementById("revealedMessage");

const errorBox =
  document.getElementById("errorMessage");


// =====================================
// READ MESSAGE FROM QR LINK
// =====================================

function loadMessage() {

  const hash = window.location.hash;

  const match = hash.match(/^#note=(.+)$/);

  if (!match) {

    showError();

    return;

  }

  try {

    const encoded = decodeURIComponent(match[1]);

    const decoded = decodeURIComponent(
      escape(atob(encoded))
    );

    const data = JSON.parse(decoded);

    if (
      typeof data.m !== "string" ||
      data.m.length === 0 ||
      data.m.length > 200
    ) {

      showError();

      return;

    }

    showMessage(data);

  } catch (error) {

    console.error("Message loading error:", error);

    showError();

  }

}


// =====================================
// SHOW MESSAGE PAGE
// =====================================

function showMessage(data) {

  title.textContent =
    data.t || "A message is waiting for you.";

  revealButton.hidden = false;

  revealButton.addEventListener("click", () => {

    messageBox.textContent = data.m;

    messageBox.hidden = false;

    revealButton.hidden = true;

  }, { once: true });

}


// =====================================
// INVALID QR
// =====================================

function showError() {

  title.textContent = "Message unavailable.";

  errorBox.hidden = false;

  revealButton.hidden = true;

  messageBox.hidden = true;

}


// =====================================
// START VIEWER
// =====================================

loadMessage();
