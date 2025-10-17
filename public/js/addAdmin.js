$(document).ready(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // 3 = SuperAdmin

  // Restrict access to only SuperAdmins
  if (!token || role !== "3") {
    alert("Access Denied! Only SuperAdmins can add Admins.");
    window.location.href = "dashboard.html";
    return;
  }

  // Load hospitals for dropdown
  loadHospitals();

  // Handle Back Button
  $("#backBtn").click(function () {
    window.location.href = "dashboard.html"; // redirect to admin list page
  });

  // Handle form submission
  $("#addAdminForm").submit(function (e) {
    e.preventDefault();

    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const password = $("#password").val().trim();
    const phone_no = $("#phone_no").val().trim();
    const gender = $("#gender").val();
    const hospital_id = $("#hospital_id").val();

    if (!name || !email || !password || !phone_no || !gender || !hospital_id) {
      showMessage("All fields are required.", "error");
      return;
    }

    $.ajax({
      url: "http://localhost:8080/api/add-Admins",
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        name,
        email,
        password,
        phone_no,
        gender,
        hospital_id,
      },
      success: function (response) {
        if (response.status) {
          showMessage("✅ " + response.Mssge, "success");
          setTimeout(() => {
            window.location.href = "admin.html";
          }, 1500);
        } else {
          const err =
            typeof response.Mssge === "object"
              ? Object.values(response.Mssge).join(", ")
              : response.Mssge || "Failed to add admin.";
          showMessage("❌ " + err, "error");
        }
      },
      error: function (xhr) {
        console.error(xhr);
        showMessage("❌ Something went wrong while adding admin.", "error");
      },
    });
  });

  // Function to load hospitals in dropdown
  function loadHospitals() {
    $.ajax({
      url: "http://localhost:8080/hospital/list-all-Hospitals",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        if (res.status && res.data && res.data.length > 0) {
          res.data.forEach((hospital) => {
            $("#hospital_id").append(
              `<option value="${hospital.id}">${hospital.name}</option>`
            );
          });
        } else {
          $("#hospital_id").html('<option value="">No hospitals found</option>');
        }
      },
      error: function (err) {
        console.error(err);
        $("#hospital_id").html('<option value="">Error loading hospitals</option>');
      },
    });
  }

  // Helper to show messages
  function showMessage(msg, type) {
    const messageDiv = $("#message");
    messageDiv.removeClass("error-msg success-msg");
    messageDiv.addClass(type === "success" ? "success-msg" : "error-msg");
    messageDiv.html(msg);
  }
});
