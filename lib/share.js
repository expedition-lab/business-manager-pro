<script>
// lib/share.js

function buildSharePayload({ receiptId, amount, clientName = "", receiptUrl }) {
  const safeUrl = receiptUrl || (location.origin + location.pathname + `?r=${encodeURIComponent(receiptId)}`);
  const title = `E-receipt #${receiptId}`;
  const textEN = `Hi ${clientName || ""} — here is your e-receipt #${receiptId} for ${amount || ""}. Download: ${safeUrl}`.trim();
  const textFR = `Bonjour ${clientName || ""} — voici votre e-reçu n°${receiptId} pour ${amount || ""}. Téléchargez : ${safeUrl}`.trim();

  return {
    url: safeUrl,
    title,
    textEN,
    textFR,
    waText: encodeURIComponent(textEN),
    mailSubject: encodeURIComponent(`Your e-receipt #${receiptId}`),
    mailBody: encodeURIComponent(`Hello ${clientName || ""},\n\nHere is your e-receipt (ref ${receiptId}) for ${amount || ""}.\n\nDownload: ${safeUrl}\n\nThanks,\nBusiness Manager Pro`)
  };
}

async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); alert("Link copied"); }
  catch { prompt("Copy this link", text); } // fallback
}

/**
 * Wire up buttons by id.
 * ids = { waId, emailId, copyId, shareId }
 */
function initShareButtons(ids, payload) {
  const p = buildSharePayload(payload);

  // WhatsApp
  const waBtn = document.getElementById(ids.waId);
  if (waBtn) waBtn.href = `https://wa.me/?text=${p.waText}`;

  // Email
  const emBtn = document.getElementById(ids.emailId);
  if (emBtn) emBtn.href = `mailto:?subject=${p.mailSubject}&body=${p.mailBody}`;

  // Copy
  const cpBtn = document.getElementById(ids.copyId);
  if (cpBtn) cpBtn.addEventListener("click", () => copyToClipboard(p.url));

  // Web Share API (mobile friendly)
  const shBtn = document.getElementById(ids.shareId);
  if (shBtn) {
    if (navigator.share) {
      shBtn.addEventListener("click", async () => {
        try { await navigator.share({ title: p.title, text: p.textEN, url: p.url }); }
        catch {}
      });
    } else {
      // hide if not supported
      shBtn.style.display = "none";
    }
  }
}

// Expose globally
window.BMPShare = { initShareButtons, buildSharePayload };
</script>
