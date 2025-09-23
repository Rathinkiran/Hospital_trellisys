$(document).ready(function () {
    // ---------- AUTH CHECK ----------
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "2"; // 0=Admin,1=Doctor,2=Patient
    const userName = localStorage.getItem("userName") || "User";

    if (!token) {
        window.location.href = "index.html";
    }

    // ---------- SET WELCOME INFO ----------
    $("#userWelcome").text(`Welcome, ${userName}`);
    $(".profile-icon").text(userName.charAt(0).toUpperCase());

    // ---------- ROLE-BASED MENU ----------
    $("#addDoctorMenu, #addPatientMenu, #bookAppointmentMenu, #patientsMenu, #appointmentsMenu").addClass("hidden");

    if (role === "0") { // Admin
        $("#addDoctorMenu, #addPatientMenu, #doctorsMenu, #patientsMenu, #appointmentsMenu,#bookAppointmentMenu").removeClass("hidden");
    } else if (role === "1") { // Doctor
        $("#patientsMenu, #appointmentsMenu, #showHistory").removeClass("hidden");
    } else if (role === "2") { // Patient
        $("#bookAppointmentMenu, #appointmentsMenu, #showHistory").removeClass("hidden");
    }

    // ---------- FETCH STATS ----------
    $.ajax({
        url: "http://localhost:8080/api/dashboard/stats",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        success: function (res) {
            $("#doctorsCount").text(res.doctors || 0);
            $("#patientsCount").text(res.patients || 0);
            $("#appointmentsCount").text(res.appointments || 0);
        }
    });

    // ---------- SIDEBAR NAVIGATION ----------
    $(".sidebar-menu li").on("click", function () {
        $(".sidebar-menu li").removeClass("active");
        $(this).addClass("active");
        const section = $(this).data("section");
        $(".section").hide();
        $(`#${section}Section`).show();
    });

    // ---------- EDIT PROFILE INLINE ----------
    $("#editProfileBtn").on("click", function () {
        // Fetch current profile
        $.ajax({
            url: "http://localhost:8080/api/update-profile",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            success: function (res) {
                const user = res.data;
                $("#editName").val(user.name);
                $("#editEmail").val(user.email);
                $("#editGender").val(user.gender);
                if (role === "1") $("#editExpertise").val(user.expertise || "");
                if (role === "2") $("#editProblem").val(user.problem || "");
                $("#editPassword").val("");
                $("#editProfileForm").slideDown();
            },
            error: function () {
                alert("Failed to load profile");
            }
        });
    });

    $("#cancelEditProfile").on("click", function () {
        $("#editProfileForm").slideUp();
    });

    $("#editProfileForm").on("submit", function (e) {
        e.preventDefault();
        const data = {
            name: $("#editName").val(),
            email: $("#editEmail").val(),
            gender: $("#editGender").val(),
            password: $("#editPassword").val(),
            expertise: role === "1" ? $("#editExpertise").val() : undefined,
            problem: role === "2" ? $("#editProblem").val() : undefined
        };

        $.ajax({
            url: "http://localhost:8080/api/update-profile",
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            data: data,
            success: function (res) {
                if (res.status) {
                    alert(res.mssge);
                    $("#editProfileForm").slideUp();
                    localStorage.setItem("userName", res.data.name);
                    $("#userWelcome").text(`Welcome, ${res.data.name}`);
                } else {
                    alert(res.mssge || "Failed to update profile");
                }
            },
            error: function () {
                alert("Error updating profile");
            }
        });
    });

    // ---------- LOGOUT ----------
    $("#logoutBtn").click(function () {
        localStorage.clear();
        window.location.href = "index.html";
    });
});
