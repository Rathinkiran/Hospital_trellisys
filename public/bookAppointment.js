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

  // --- Load doctors ---
  function loadDoctors(department = "all") {
    $.ajax({
      url: "http://localhost:8080/api/list-Doctors",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        console.log("Doctors API response:", res);
        $("#doctorSelect").empty().append(`<option value="">-- Select Doctor --</option>`);
        const doctors = res.data || [];
        doctors.forEach(doc => {
          if (department === "all" || doc.expertise.toLowerCase().includes(department.toLowerCase())) {
            $("#doctorSelect").append(`<option value="${doc.id}">${doc.name} (${doc.expertise})</option>`);
          }
        });
      },
      error: function (xhr) {
        console.error("Error fetching doctors", xhr.responseText);
        $("#responseMessage").removeClass("success").addClass("error")
          .text("Failed to load doctors. Check console for details.");
      }
    });
  }

  if (role === "2") loadDoctors();

  // --- Department filter ---
  $("#departmentSelect").on("change", function () {
    loadDoctors($(this).val());
  });

  // --- Back button ---
  $("#backBtn").click(function () {
    window.location.href = "dashboard.html";
  });

  // --- Form submit ---
  $("#bookForm").on("submit", function (e) {
    e.preventDefault();

    const doctorId = $("#doctorSelect").val();
    const appointment_date = $("#appointmentDate").val();
    const time24 = $("#appointmentTime").val();

    if (!doctorId || !appointment_date || !time24) {
      $("#responseMessage").removeClass("success").addClass("error")
        .text("Please fill all fields.");
      return;
    }

    // Convert time to 12-hour format
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 === 0 ? 12 : hour % 12;
    const appointment_startTime = `${hour}:${m} ${ampm}`;

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const patientId = payload.user?.id;

    $.ajax({
      url: "http://localhost:8080/appointment/Book-appointment",
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data: { doctorId, appointment_date, appointment_startTime, patientId },
      success: function (res) {
  if (res.status) {
    $("#responseMessage").removeClass("error").addClass("success").text(res.mssge);

    // Generate and download PDF
    generateAppointmentPDF(res);

    // Redirect to appointments.html after a short delay
    setTimeout(() => {
      window.location.href = "appointments.html";
    }, 3000); // 3 second delay to allow PDF download to start
  } else {
    $("#responseMessage").removeClass("success").addClass("error")
      .text(res.mssge || JSON.stringify(res.error));
  }
}
,
      error: function (xhr) {
        $("#responseMessage").removeClass("success").addClass("error")
          .text("Error: " + xhr.responseText);
      }
    });
  });

  // --- PDF generation ---
function generateAppointmentPDF(apiResponse) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const appointment = apiResponse.appointment;
  console.log(appointment);
  doc.setFontSize(16);
  doc.text("Appointment Confirmation", 20, 20);

  doc.setFontSize(12);
  doc.text(`Appointment ID: ${apiResponse.Result || "N/A"}`, 20, 40);
  doc.text(`Patient Name: ${appointment.patientName || "N/A"}`, 20, 50);
  doc.text(`Doctor Name: ${appointment.doctorName || "N/A"}`, 20, 60);
  doc.text(`Date: ${appointment.date || "N/A"}`, 20, 70);
  doc.text(`Time: ${appointment.time || "N/A"}`, 20, 80);
  doc.text(`Status: Booked`, 20, 90);

  doc.text("Thank you for booking your appointment.", 20, 110);

  doc.save(`appointment_${apiResponse.Result || "unknown"}.pdf`);
}

});