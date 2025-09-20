$(document).ready(function () {
    // ---------- AUTH CHECK ----------
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // "0"=Admin, "1"=Doctor, "2"=Patient
    const userName = localStorage.getItem("userName") || "User";

    if (!token) {
        window.location.href = "index.html"; // redirect if not logged in
    }

    // ---------- SET WELCOME INFO ----------
    $("#userWelcome").text(`Welcome, ${userName}`);
    $("#profileIcon").text(userName.charAt(0).toUpperCase());
    $("#userRoleInfo").text(`You are logged in as: ${role === "0" ? "Admin" : role === "1" ? "Doctor" : "Patient"}`);

    // ---------- ROLE-BASED MENU ----------
    // Hide all role-specific items first
    $("#addDoctorMenu, #addPatientMenu, #bookAppointmentMenu, #patientsMenu, #appointmentsMenu").addClass("hidden");

    if (role === "0") { // Admin
        $("#addDoctorMenu, #addPatientMenu, #doctorsMenu, #patientsMenu, #appointmentsMenu").removeClass("hidden");
    } else if (role === "1") { // Doctor
        $("#patientsMenu, #appointmentsMenu").removeClass("hidden");
    } else if (role === "2") { // Patient
        $("#bookAppointmentMenu, #appointmentsMenu").removeClass("hidden");
    }


    // ---------- PROFILE BUTTONS ----------
    $("#editProfileBtn").on("click", function() {
        window.location.href = "editProfile.html"; // your edit profile page
    });

    $("#logoutBtn").on("click", function() {
        localStorage.clear();
        window.location.href = "index.html";
    });


    // ---------- FETCH STATS ----------
    $.ajax({
        url: "http://localhost:8080/api/dashboard/stats",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        success: function(res) {
            $("#doctorsCount").text(res.doctors || 0);
            $("#patientsCount").text(res.patients || 0);
            $("#appointmentsCount").text(res.appointments || 0);
        },
        error: function() {
            $("#doctorsCount").text("0");
            $("#patientsCount").text("0");
            $("#appointmentsCount").text("0");
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

    // ---------- INITIALIZE DASHBOARD SECTION ----------
   // $(".section").hide(); // hide all sections initially
    // $("#dashboardSection").show(); // show dashboard by default
    // $(".sidebar-menu li[data-section='dashboard']").addClass("active");
});
