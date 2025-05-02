document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("inventory");
  const searchInput = document.getElementById("search");

  function renderList(data) {
    list.innerHTML = "";
    data.forEach((key) => {
      const li = document.createElement("li");
      li.textContent = key;
      list.appendChild(li);
    });
  }

  let allItems = [];

  db.ref("inventory").on("value", (snapshot) => {
    allItems = [];
    snapshot.forEach((child) => {
      allItems.push(child.key);
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
          if (mode === "add") {
            db.ref("inventory/" + qrCodeMessage).set(true);
          } else if (mode === "remove") {
            db.ref("inventory/" + qrCodeMessage).remove();
          }
          alert(`${mode === "add" ? "Added" : "Removed"}: ${qrCodeMessage}`);
        });
      },
      (errorMessage) => {
        // ignore errors
      }
    )
    .catch((err) => {
      console.error("Camera start error", err);
      alert("Failed to access camera. Make sure to allow camera permissions.");
    });
}
