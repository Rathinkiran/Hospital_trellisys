$(document).ready(function () {
  const BASE_URL = "http://localhost:8080";
  const tokenKey = "token";
  const hospitalKey = "hospital_id";
  const roleKey = "role";

  // Fetch hospital list on page load
  $.ajax({
    url: `${BASE_URL}/hospital/list-all-Hospitals`,
    method: "GET",
    success: function (res) {
      if (res.status && Array.isArray(res.data)) {
        res.data.forEach((hosp) => {
          $("#hospital_id").append(
            `<option value="${hosp.id}">${hosp.name}</option>`
          );
        });
      }
    },
    error: function () {
      console.error("Error fetching hospitals list");
    },
  });

  // Show/Hide hospital dropdown based on role
  $("#role").on("change", function () {
    const role = $(this).val();
    if (role === "0" || role === "1") {
      $("#hospitalSection").slideDown();
    } else {
      $("#hospitalSection").slideUp();
      $("#hospital_id").val("");
    }
  });

  // Handle Login
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const email = $("#email").val().trim();
    const password = $("#password").val().trim();
    const role = $("#role").val();
    const hospital_id = $("#hospital_id").val();

    if (!email || !password || !role) {
      $("#errorMsg").text("Please fill all required fields.");
      return;
    }

    // For admin/doctor hospital selection is mandatory
    if ((role === "0" || role === "1") && !hospital_id) {
      $("#errorMsg").text("Please select a hospital.");
      return;
    }

    $.ajax({
      url: `${BASE_URL}/login`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        email,
        password,
        role: parseInt(role),
        hospital_id: hospital_id ? parseInt(hospital_id) : null,
      }),
      success: function (res) {
        if (res.status && res.token) {
          sessionStorage.setItem(tokenKey, res.token);
          sessionStorage.setItem(roleKey, role);
          sessionStorage.setItem(hospitalKey, hospital_id || "");

          // Redirect based on role
          switch (role) {
            case "3":
              window.location.href = "dashboard.html";
              break;
            case "0":
              window.location.href = "dashboard.html";
              break;
            case "1":
              window.location.href = "dashboard.html";
              break;
            case "2":
              window.location.href = "dashboard.html";
              break;
            default:
              window.location.href = "index.html";
          }
        } else {
          $("#errorMsg").text(res.message || "Invalid credentials");
        }
      },
      error: function (xhr) {
        const message =
          xhr.responseJSON?.message || "Error during login. Try again.";
        $("#errorMsg").text(message);
      },
    });
  });
});
