$(document).ready(function () {
  const API_BASE = "http://localhost:8080";
  const hospitalId = sessionStorage.getItem("selectedHospitalId");

  // Fetch hospital name
  if (hospitalId) {
    $.ajax({
      url: `${API_BASE}/hospital/get-Hospital-Info`,
      method: "POST",
      data: { hospital_id: hospitalId },
      success: function (res) {
        if (res.status) {
          $("#hospitalName").text(`Welcome to ${res.data.name}`);
        }
      },
    });
  }

  // Switch between tabs
  $(".tab-link").on("click", function () {
    $(".tab-link").removeClass("active");
    $(this).addClass("active");
    $(".tab-content").removeClass("active");
    $("#" + $(this).data("tab")).addClass("active");
  });

  // Login handler
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();
    const email = $("#loginEmail").val();
    const password = $("#loginPassword").val();
    const role = $("#loginRole").val();

    if (!role) {
      showMessage("#loginMessage", "Please select a role", false);
      return;
    }

    const data = { email, password };

    // Attach hospital_id for doctor/admin only
    if (role === "0" || role === "1") {
      data.hospital_id = hospitalId;
    }

    $.ajax({
      url: `${API_BASE}/login`,
      method: "POST",
      data,
      success: function (res) {
        if (res.status) {
          sessionStorage.setItem("token", res.token);
          sessionStorage.setItem("role", res.role);
          sessionStorage.setItem("hospital_id", res.hospital_id || hospitalId);
          sessionStorage.setItem("userName", res.userName);

          showMessage("#loginMessage", "Login successful!", true);
          setTimeout(() => (window.location.href = "dashboard.html"), 1000);
        } else {
          showMessage("#loginMessage", res.mssge || "Login failed", false);
        }
      },
      error: function () {
        showMessage("#loginMessage", "Server error", false);
      },
    });
  });

  // Registration handler
  $("#registerForm").on("submit", function (e) {
    e.preventDefault();
    const data = {
      name: $("#regName").val(),
      gender: $("#regGender").val(),
      email: $("#regEmail").val(),
      password: $("#regPassword").val(),
      problem: $("#regProblem").val(),
      phone_no: $("#regPhone").val() || null,
    };

    $.ajax({
      url: `${API_BASE}/register`,
      method: "POST",
      data,
      success: function (res) {
        if (res.status) {
          showMessage("#registerMessage", "Registered successfully!", true);
        } else {
          showMessage("#registerMessage", res.mssge || "Registration failed", false);
        }
      },
      error: function () {
        showMessage("#registerMessage", "Server error", false);
      },
    });
  });

  function showMessage(selector, text, success = true) {
    const el = $(selector);
    el.removeClass("success error")
      .addClass(success ? "success" : "error")
      .text(text)
      .fadeIn()
      .delay(2000)
      .fadeOut();
  }
});
