$(document).ready(function () {
    // Tab switching
    $(".tab-link").on("click", function () {
        var tab = $(this).data("tab");

        // Remove active class from all tabs and buttons
        $(".tab-link").removeClass("active");
        $(".tab-content").removeClass("active");

        // Add active class to clicked button and corresponding content
        $(this).addClass("active");
        $("#" + tab).addClass("active");
    });

    // Password toggle
    $(".password-toggle").on("click", function () {
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
});



    // ---------------- LOGIN ----------------
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();

        const email = $("#loginEmail").val().trim();
        const password = $("#loginPassword").val().trim();

        $.ajax({
            url: "http://localhost:8080/login",   
            method: "POST",
            data: { email, password },
            success: function (res) {
                if (res.status) {
                    // Save token + role in localStorage
                    localStorage.setItem("token", res.token);
                    localStorage.setItem("role", res.role);
                    localStorage.setItem("userName", res.userName);

                    $("#loginMessage").text(res.mssge).css("color", "green");

                    setTimeout(() => {
                        window.location.href = "dashboard.html"; // redirect after login
                    }, 1000);
                } else {
                    $("#loginMessage").text(res.mssge || "Invalid login").css("color", "red");
                }
            },
            error: function (xhr) {
                $("#loginMessage").text(xhr.responseJSON?.mssge || "Error logging in").css("color", "red");
            }
        });
    });

    // ---------------- REGISTER ----------------
    $("#registerForm").on("submit", function (e) {
        e.preventDefault();

        const data = {
            name: $("#regName").val().trim(),
            gender: $("#regGender").val(),
            problem: $("#regProblem").val().trim(),
            email: $("#regEmail").val().trim(),
            password: $("#regPassword").val().trim(),
        };

        $.ajax({
            url: "http://localhost:8080/register",   // ✅ matches CodeIgniter route
            method: "POST",
            data: data,
            success: function (res) {
                if (res.status) {
                    $("#registerMessage").text(res.mssge).css("color", "green");

                    setTimeout(() => {
                        window.location.href = "index.html"; // after register → back to login
                    }, 1200);
                } else {
                    $("#registerMessage").text(res.mssge || "Registration failed").css("color", "red");
                }
            },
            error: function (xhr) {
                const errMsg = xhr.responseJSON?.error
                    ? Object.values(xhr.responseJSON.error).join(", ")
                    : "Error registering";
                $("#registerMessage").text(errMsg).css("color", "red");
            }
        });
    });

