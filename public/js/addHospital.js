$(document).ready(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // 3 = SuperAdmin

  // Restrict non-superadmins
  if (!token || role !== "3") {
    alert("Access Denied!");
    window.location.href = "dashboard.html";
    return;
  }

  // Handle Back button
  $("#backBtn").click(function () {
    window.location.href = "dashboard.html";
  });

  // Handle Form Submission
  $("#addHospitalForm").submit(function (e) {
    e.preventDefault();

    const name = $("#name").val().trim();
    const address = $("#address").val().trim();
    const contact_no = $("#contact_no").val().trim();
    const code = $("#code").val().trim();

    if (!name || !address || !contact_no || !code) {
      showMessage("All fields are required.", "error");
      return;
    }

    $.ajax({
      url: "http://localhost:8080/api/add-Hospital",
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        name,
        address,
        contact_no,
        code
      },
      success: function (response) {
        if (response.status) {
          showMessage("✅ " + response.Mssge, "success");
          setTimeout(() => {
            window.location.href = "hospitals.html";
          }, 1500);
        } else {
          const err =
            typeof response.Mssge === "object"
              ? Object.values(response.Mssge).join(", ")
              : response.Mssge || "Failed to add hospital.";
          showMessage("❌ " + err, "error");
        }
      },
      error: function (xhr) {
        console.error(xhr);
        showMessage("❌ Something went wrong while adding hospital.", "error");
      }
    });
  });

  // Helper to display messages
  function showMessage(msg, type) {
    const messageDiv = $("#message");
    messageDiv.removeClass("error-msg success-msg");
    messageDiv.addClass(type === "success" ? "success-msg" : "error-msg");
    messageDiv.html(msg);
  }
});
