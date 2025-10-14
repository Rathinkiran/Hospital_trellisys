$(document).ready(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    alert("Login required");
    window.location.href = "dashboard.html";
    return;
  }

  if (role !== "2") {
    $("#bookForm input, #bookForm select, #bookForm button").prop("disabled", true);
    $("#responseMessage").addClass("error").text("⚠️ Only patients can book appointments.");
  }

  // --- Load all hospitals ---
  function loadHospitals() {
    $.ajax({
      url: "http://localhost:8080/hospital/list-all-Hospitals",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        $("#hospitalSelect").empty().append(`<option value="">-- Select Hospital --</option>`);
        const hospitals = res.data || [];
        hospitals.forEach(h => {
          $("#hospitalSelect").append(`<option value="${h.id}">${h.name}</option>`);
        });
      },
      error: function (xhr) {
        console.error("Error loading hospitals:", xhr.responseText);
        $("#responseMessage").addClass("error").text("Failed to load hospitals.");
      }
    });
  }

  // --- Load doctors hospital-wise ---
  function loadDoctorsHospitalWise(hospitalId, department = "all") {
    if (!hospitalId) {
      $("#doctorSelect").empty().append(`<option value="">-- Select Hospital First --</option>`);
      return;
    }

    $.ajax({
      url: "http://localhost:8080/api/list-Doctors-Hospital-Wise",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      data: { hospital_id: hospitalId },
      success: function (res) {
        console.log("Doctors by hospital response:", res);
        $("#doctorSelect").empty().append(`<option value="">-- Select Doctor --</option>`);
        const doctors = res.data || [];
        doctors.forEach(doc => {
          if (department === "all" || (doc.expertise && doc.expertise.toLowerCase().includes(department.toLowerCase()))) {
            $("#doctorSelect").append(`<option value="${doc.id}">${doc.name} (${doc.expertise || "N/A"})</option>`);
          }
        });
      },
      error: function (xhr) {
        console.error("Error fetching doctors:", xhr.responseText);
        $("#responseMessage").removeClass("success").addClass("error").text("Failed to load doctors.");
      }
    });
  }

  // Load hospitals on page load
  if (role === "2") loadHospitals();

  // When hospital is selected → load its doctors
  $("#hospitalSelect").on("change", function () {
    const hospitalId = $(this).val();
    const department = $("#departmentSelect").val();
    loadDoctorsHospitalWise(hospitalId, department);
  });

  // When department changes → reload doctors for that hospital + department
  $("#departmentSelect").on("change", function () {
    const hospitalId = $("#hospitalSelect").val();
    loadDoctorsHospitalWise(hospitalId, $(this).val());
  });

  // Back button
  $("#backBtn").click(function () {
    window.location.href = "dashboard.html";
  });

  // --- Book appointment ---
  $("#bookForm").on("submit", function (e) {
    e.preventDefault();

    const hospital_id = $("#hospitalSelect").val();
    const doctorId = $("#doctorSelect").val();
    const appointment_date = $("#appointmentDate").val();
    const time24 = $("#appointmentTime").val();

    if (!hospital_id || !doctorId || !appointment_date || !time24) {
      $("#responseMessage").removeClass("success").addClass("error").text("Please fill all fields.");
      return;
    }

    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 === 0 ? 12 : hour % 12;
    const appointment_startTime = `${hour}:${m} ${ampm}`;

    $.ajax({
      url: "http://localhost:8080/appointment/Book-appointment",
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data: { doctorId, hospital_id, appointment_date, appointment_startTime },
      success: function (res) {
        if (res.status) {
          $("#responseMessage").removeClass("error").addClass("success").text(res.mssge);
          setTimeout(() => {
            window.location.href = "appointments.html";
          }, 2500);
        } else {
          $("#responseMessage").removeClass("success").addClass("error").text(res.mssge || JSON.stringify(res.error));
        }
      },
      error: function (xhr) {
        $("#responseMessage").removeClass("success").addClass("error").text("Error: " + xhr.responseText);
      }
    });
  });
});
