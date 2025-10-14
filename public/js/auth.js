$(document).ready(function () {
  // ---------------- TAB SWITCH ----------------
  $(".tab-link").on("click", function () {
    $(".tab-link").removeClass("active");
    $(".tab-content").removeClass("active");

    $(this).addClass("active");
    $("#" + $(this).data("tab")).addClass("active");
  });

  // ---------------- PASSWORD VISIBILITY ----------------
  $(document).on("click", ".password-toggle", function () {
    const input = $(this).siblings("input");
    const icon = $(this).find("i");

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      input.attr("type", "password");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });

  // ---------------- LOGIN ----------------
  // ---------------- LOGIN ----------------
$("#loginForm").on("submit", function (e) {
  e.preventDefault();

  const email = $("#loginEmail").val().trim();
  const password = $("#loginPassword").val().trim();
  const role = $("#loginRole").val();

  // Convert role to number
  const roleNum = role !== "" ? Number(role) : null;

  if (!email || !password || roleNum === null) {
    $("#loginMessage").text("All fields are required").css("color", "red");
    return;
  }

  $.ajax({
    url: "http://localhost:8080/login",
    method: "POST",
    data: { email, password, role: roleNum }, // send number
    success: function (res) {
      if (res.status) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role);
        localStorage.setItem("userName", res.userName);
        localStorage.setItem("hospital_id", res.hospital_id || "");

        $("#loginMessage").text(res.mssge).css("color", "green");

        setTimeout(() => {
          if (res.role == 0) window.location.href = "dashboard.html";
          else if (res.role == 1) window.location.href = "dashboard.html";
          else if (res.role == 2) window.location.href = "dashboard.html";
          else if (res.role == 3) window.location.href = "dashboard.html";
          else window.location.href = "index.html";
        }, 1000);
      } else {
        $("#loginMessage")
          .text(res.mssge || "Invalid credentials")
          .css("color", "red");
      }
    },
    error: function (xhr) {
      $("#loginMessage")
        .text(xhr.responseJSON?.mssge || "Login error")
        .css("color", "red");
    },
  });
});

  // ---------------- REGISTER (PATIENT) ----------------
  $("#registerForm").on("submit", function (e) {
    e.preventDefault();

    const data = {
      name: $("#regName").val().trim(),
      gender: $("#regGender").val(),
      problem: $("#regProblem").val().trim(),
      email: $("#regEmail").val().trim(),
      password: $("#regPassword").val().trim(),
      phone_no: $("#regPhone").val().trim(),
      role: 2, // always patient
    };

    if (
      !data.name ||
      !data.gender ||
      !data.problem ||
      !data.email ||
      !data.password ||
      !data.phone_no
    ) {
      $("#registerMessage").text("All fields are required").css("color", "red");
      return;
    }

    $.ajax({
      url: "http://localhost:8080/register",
      method: "POST",
      data,
      success: function (res) {
        if (res.status) {
          $("#registerMessage").text(res.mssge).css("color", "green");
          setTimeout(() => window.location.href = "index.html", 1000);
        } else {
          $("#registerMessage")
            .text(res.mssge || "Registration failed")
            .css("color", "red");
        }
      },
      error: function (xhr) {
        const errMsg =
          xhr.responseJSON?.error
            ? Object.values(xhr.responseJSON.error).join(", ")
            : "Registration error";
        $("#registerMessage").text(errMsg).css("color", "red");
      },
    });
  });
});
