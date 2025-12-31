
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  const message = document.getElementById('bookingMessage');
  const refInput = document.getElementById('bookingRef');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Generate booking reference
    const ref = 'ECL-' + Date.now().toString().slice(-6);
    if (refInput) refInput.value = ref;

    const formData = new FormData(form);
    const name = formData.get('name');
    const service = formData.get('service');
    const stylist = formData.get('stylist') || 'No preference';
    const date = formData.get('date');
    const time = formData.get('time');
    const phone = formData.get('phone');

    message.innerHTML = `<div class="hero-card"><strong>Processing…</strong></div>`;

    try {
      const response = await fetch(form.action, { method: 'POST', body: formData });
      const result = await response.json();

      if (result.success) {
        form.remove();
        message.innerHTML = `
          <div class="hero-card">
            <h3>Booking Confirmed</h3>
            <p><strong>Ref:</strong> <span style="color:var(--gold)">${ref}</span></p>
            <p>${service} • ${stylist}</p>
            <p>${date} • ${time}</p>
            <p>${name} • ${phone}</p>
            <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
              <button id="downloadTicket" class="btn-primary">Download Ticket (PDF)</button>
              <a id="waLink" class="btn-gold" href="#" target="_blank">Message via WhatsApp</a>
              <button id="bookAgain" class="btn-ghost">Book Again</button>
            </div>
          </div>
        `;

        const wa = document.getElementById('waLink');
        if (wa) {
          const salonNumber = "+918822030323"; // your WhatsApp number
          const salonSan = salonNumber.replace(/\s+/g, '').replace(/\+/g, '');

          wa.href = `https://wa.me/${encodeURIComponent(salonSan)}?text=${encodeURIComponent(
            `Hello Éclat! I have a confirmed booking.\nRef: ${ref}\nName: ${name}\nService: ${service}\nDate: ${date} • ${time}`
          )}`;
        }

        const downloadBtn = document.getElementById('downloadTicket');
        if (downloadBtn) {
          downloadBtn.addEventListener('click', async () => {

            // wait a tiny moment to ensure QR is rendered
            await new Promise(res => setTimeout(res, 200));

            downloadTicket(ref, name, service, stylist, date, time);
          });
        }


        document.getElementById('bookAgain').addEventListener('click', () => {
          window.location.hash = '#booking';
          window.location.reload();
        });

      } else {
        message.innerHTML = `<div class="hero-card">⚠ Unable to complete booking. Try again.</div>`;
      }

    } catch (err) {
      console.error(err);
      message.innerHTML = `<div class="hero-card">⚠ Network error. Please try again later.</div>`;
    }
  });

  function downloadTicket(ref, name, service, stylist, date, time) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const qrContainer = document.createElement('div');
    new QRCode(qrContainer, { text: ref, width: 160, height: 160 });
    let qrImg;
    const imgEl = qrContainer.querySelector("img");
    const canvasEl = qrContainer.querySelector("canvas");

    if (imgEl && imgEl.src) {
      qrImg = imgEl.src;
    } else if (canvasEl) {
      qrImg = canvasEl.toDataURL("image/png");
    }


    pdf.setFillColor(10, 6, 10);
    pdf.rect(0, 0, 595, 90, 'F');

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ÉCLAT SALON — Booking Ticket', 40, 54);

    pdf.setTextColor(20, 20, 20);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Ref: ${ref}`, 40, 120);
    pdf.text(`Name: ${name}`, 40, 140);
    pdf.text(`Service: ${service}`, 40, 160);
    pdf.text(`Stylist: ${stylist}`, 40, 180);
    pdf.text(`Date: ${date}`, 40, 200);
    pdf.text(`Time: ${time}`, 40, 220);

    pdf.addImage(qrImg, 'PNG', 400, 120, 150, 150);

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text('Show this ticket at reception for a fast check-in.', 40, 260);

    pdf.save(`Eclat-Booking-${ref}.pdf`);
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  const startBooking = document.getElementById("startBooking");
  const bookingCard = document.querySelector(".hero-card");


  if (startBooking && bookingCard) {
    startBooking.addEventListener("click", (e) => {
      e.preventDefault();

      // Restore the booking form if it was replaced by confirmation
      bookingCard.innerHTML = form.outerHTML + '<div id="bookingMessage" class="booking-message" role="status" aria-live="polite"></div>';

      // Scroll the card into view smoothly
      bookingCard.scrollIntoView({ behavior: "smooth", block: "start" });

      // Focus the Name input
      const nameInput = bookingCard.querySelector("input[name='name']");
      if (nameInput) nameInput.focus({ preventScroll: true });

      // Optional pulse animation
      bookingCard.classList.add("pulse-card");
      setTimeout(() => bookingCard.classList.remove("pulse-card"), 1000);
    });
  }










}); // end DOMContentLoaded











