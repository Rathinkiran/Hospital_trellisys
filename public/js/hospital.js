$(document).ready(function () {
  const token = localStorage.getItem("token");

  // Back button → dashboard.html
  $("#backBtn").click(function () {
    window.location.href = "dashboard.html";
  });

  // Load all hospitals
  function loadHospitals() {
    $.ajax({
      url: "http://localhost:8080/hospital/list-all-Hospitals",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        if (res.status && res.data.length > 0) {
          renderHospitals(res.data);
        } else {
          $("#hospitalsContainer").html(
            `<p style="color:red;">No hospitals found.</p>`
          );
        }
      },
      error: function (err) {
        console.error(err);
        $("#hospitalsContainer").html(
          `<p style="color:red;">Error fetching hospitals.</p>`
        );
      },
    });
  }

  // Render hospital cards
  function renderHospitals(hospitals) {
    $("#hospitalsContainer").empty();
    hospitals.forEach((hospital) => {
      const card = $(`
        <div class="hospital-card" data-id="${hospital.id}">
          <div class="hospital-name">${hospital.name}</div>
          <div class="hospital-details">Address: ${
            hospital.address || "N/A"
          }</div>

          <div class="options">
            <button class="option-btn doctors-btn">👨‍⚕️ Doctors</button>
            <button class="option-btn patients-btn">🧍 Patients</button>
            <button class="option-btn admins-btn">🧑‍💼 Admins</button>
            <button class="option-btn appointments-btn">📅 Appointments</button>
          </div>
        </div>
      `);

      // Expand / collapse on click
      card.click(function () {
        const isExpanded = $(this).hasClass("hospital-expanded");
        $(".hospital-card").removeClass("hospital-expanded");
        $(".options").slideUp();

        if (!isExpanded) {
          $(this).addClass("hospital-expanded");
          $(this).find(".options").slideDown();
        }
      });

      // Navigation buttons
      card.find(".doctors-btn").click(function (e) {
        e.stopPropagation();
        redirectTo("doctor.html", hospital.id);
      });

      card.find(".patients-btn").click(function (e) {
        e.stopPropagation();
        redirectTo("patient.html", hospital.id);
      });

      card.find(".admins-btn").click(function (e) {
        e.stopPropagation();
        redirectTo("admin.html", hospital.id);
      });

      card.find(".appointments-btn").click(function (e) {
        e.stopPropagation();
        redirectTo("appointments.html", hospital.id);
      });

      $("#hospitalsContainer").append(card);
    });
  }

  // Redirect function
  function redirectTo(page, hospitalId) {
    localStorage.setItem("selectedHospitalId", hospitalId);
    window.location.href = page;
  }

  // Initial load
  loadHospitals();
});
