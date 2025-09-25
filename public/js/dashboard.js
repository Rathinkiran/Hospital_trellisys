$(document).ready(function () {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "2"; // 0=Admin,1=Doctor,2=Patient
    const userName = localStorage.getItem("userName") || "User";

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    // ---------- SET WELCOME INFO ----------
    $("#userWelcome").text(`Welcome, ${userName}`);
    $(".profile-icon").text(userName.charAt(0).toUpperCase());

    // ---------- ROLE-BASED MENU ----------
    $("#addDoctorMenu, #addPatientMenu, #bookAppointmentMenu, #patientsMenu, #appointmentsMenu, #doctorsMenu, #showHistory").addClass("hidden");

    if (role === "0") { // Admin
        $("#addDoctorMenu, #addPatientMenu, #doctorsMenu, #patientsMenu, #appointmentsMenu, #bookAppointmentMenu").removeClass("hidden");
        $("#dashboardSection").show();
        $("#patientDashboardSection").hide();
    } else if (role === "1") { // Doctor
        $("#patientsMenu, #appointmentsMenu, #showHistory").removeClass("hidden");
        $("#dashboardSection").show();
        $("#patientDashboardSection").hide();
    } else if (role === "2") { // Patient
        $("#bookAppointmentMenu, #appointmentsMenu, #showHistory").removeClass("hidden");
        $("#dashboardSection").hide();
        $("#patientDashboardSection").show();

        // Fetch patient details
        $.ajax({
            url: "http://localhost:8080/appointment/getDetailsforPatient",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            success: function (res) {
                if (res.status) {
                    $("#pName").text(res.data.name || "-");
                    $("#pEmail").text(res.data.email || "-");
                    $("#pGender").text(res.data.gender || "-");
                    $("#pDOB").text(res.data.DOB || "-");
                    $("#pPhoto").attr("src", res.data.photo || "https://via.placeholder.com/100");
                }
            }
        });

        // Fetch patient stats
        $.ajax({
            url: "http://localhost:8080/appointment/getPatientStats",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            success: function (res) {
                if (res.status) {
                const labels = res.data.map(d => d.date);
                const weights = res.data.map(d => d.weight);
                const systolic = res.data.map(d => d.bp_systolic);
                const diastolic = res.data.map(d => d.bp_diastolic);

                    // Ensure the section is visible
                          new Chart(document.getElementById("weightChart"), {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Weight (kg)",
                            data: weights,
                            borderColor: "#2a6bc9",
                            backgroundColor: "rgba(42,107,201,0.2)",
                            fill: true,
                            tension: 0.3
                        }]
                    }
                });

                // BP Chart
                new Chart(document.getElementById("bpChart"), {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: "Systolic",
                                data: systolic,
                                borderColor: "#e53e3e",
                                backgroundColor: "rgba(229,62,62,0.2)",
                                fill: true,
                                tension: 0.3
                            },
                            {
                                label: "Diastolic",
                                data: diastolic,
                                borderColor: "#38a169",
                                backgroundColor: "rgba(56,161,105,0.2)",
                                fill: true,
                                tension: 0.3
                            }
                        ]
                    }
                });
            }
        }
    });
}

    // ---------- FETCH ADMIN STATS ----------
    if (role === "0") {
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
    }

    // ---------- SIDEBAR NAVIGATION ----------
    $(".sidebar-menu li").on("click", function () {
        $(".sidebar-menu li").removeClass("active");
        $(this).addClass("active");
        const section = $(this).data("section");
        $(".section").hide();
        $(`#${section}Section`).show();
        // Update charts if patient section is shown
        if (section === "patientDashboard" && window.weightChart) {
            window.weightChart.update();
            window.bpChart.update();
        }
    });

    // ---------- EDIT PROFILE ----------
    $("#editProfileBtn").on("click", function () {
        $.ajax({
            url: "http://localhost:8080/api/update-profile",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            success: function (res) {
                const user = res.data || {};
                $("#editName").val(user.name || "");
                $("#editEmail").val(user.email || "");
                $("#editGender").val(user.gender || "");
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
                    alert(res.mssge || "Profile updated");
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
