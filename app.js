document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("inventory");
  const searchInput = document.getElementById("search");

  function renderList(data) {
    list.innerHTML = "";
    data.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      list.appendChild(li);
    });
  }

  let allItems = [];

  db.ref("inventory").on("value", (snapshot) => {
    allItems = [];
    snapshot.forEach((child) => {
      const product = child.key;
      const meter = child.val().meter || 0;
      allItems.push(`${product} - ${meter}m`);
    });
    renderList(allItems);
  });

  searchInput.addEventListener("input", () => {
    const filtered = allItems.filter((item) =>
      item.toLowerCase().includes(searchInput.value.toLowerCase())
    );
    renderList(filtered);
  });
});

function parseItemInput(inputText) {
  const match = inputText.trim().match(/^([A-Z0-9]+)-(\d+)M$/i);
  if (!match) return null;
  return {
    productCode: match[1].toUpperCase(),
    meter: parseInt(match[2]),
  };
}

function manualAddItem() {
  const codeInput = document.getElementById("addCode");
  const meterInput = document.getElementById("addMeter");

  const productCode = codeInput.value.trim().toUpperCase();
  const meter = parseInt(meterInput.value.trim());

  if (!productCode || isNaN(meter) || meter <= 0) {
    alert("Please enter a valid product code and meter value.");
    return;
  }

  const ref = db.ref("inventory/" + productCode);

  ref.get().then((snapshot) => {
    const existing = snapshot.val();
    const currentMeter = existing ? existing.meter || 0 : 0;
    ref.set({ meter: currentMeter + meter });
    alert(`Added ${meter} meters to ${productCode}.`);
    codeInput.value = "";
    meterInput.value = "";
  });
}

function manualRemoveItem() {
  const codeInput = document.getElementById("removeCode");
  const meterInput = document.getElementById("removeMeter");

  const productCode = codeInput.value.trim().toUpperCase();
  const meter = parseInt(meterInput.value.trim());

  if (!productCode || isNaN(meter) || meter <= 0) {
    alert("Please enter a valid product code and meter value.");
    return;
  }

  const ref = db.ref("inventory/" + productCode);

  ref.get().then((snapshot) => {
    if (!snapshot.exists()) {
      alert(`Product ${productCode} does not exist.`);
      return;
    }

    const currentMeter = snapshot.val().meter || 0;
    if (meter > currentMeter) {
      alert(`Cannot remove ${meter}m. Only ${currentMeter}m available.`);
      return;
    }

    const newMeter = currentMeter - meter;
    if (newMeter === 0) {
      ref.remove();
    } else {
      ref.set({ meter: newMeter });
    }

    alert(`Removed ${meter} meters from ${productCode}.`);
    codeInput.value = "";
    meterInput.value = "";
  });
}

function startScan(mode) {
  const qrRegion = document.getElementById("scanner");
  qrRegion.innerHTML = "";
  qrRegion.style.display = "block";

  const html5QrCode = new Html5Qrcode("scanner");
  html5QrCode
    .start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (qrCodeMessage) => {
        html5QrCode.stop().then(() => {
          qrRegion.style.display = "none";

          const parsed = parseItemInput(qrCodeMessage);
          if (!parsed) {
            alert("Invalid QR format. Use: PRODUCTCODE-123M");
            return;
          }

          const { productCode, meter } = parsed;
          const ref = db.ref("inventory/" + productCode);

          ref.get().then((snapshot) => {
            const existing = snapshot.val();
            const currentMeter = existing ? existing.meter || 0 : 0;

            if (mode === "add") {
              ref.set({ meter: currentMeter + meter });
              alert(`Scanned and added ${meter}m to ${productCode}`);
            } else if (mode === "remove") {
              if (!snapshot.exists()) {
                alert(`Product ${productCode} does not exist.`);
                return;
              }

              if (meter > currentMeter) {
                alert(
                  `Cannot remove ${meter}m. Only ${currentMeter}m available.`
                );
                return;
              }

              const newMeter = currentMeter - meter;
              if (newMeter === 0) {
                ref.remove();
              } else {
                ref.set({ meter: newMeter });
              }

              alert(`Scanned and removed ${meter}m from ${productCode}`);
            }
          });
        });
      },
      (errorMessage) => {
        // silent error
      }
    )
    .catch((err) => {
      console.error("Camera start error", err);
      alert("Failed to access camera. Make sure to allow camera permissions.");
    });
}
