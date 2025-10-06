$(document).ready(function () {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "2"; // 0=Admin, 1=Doctor, 2=Patient
    const userName = localStorage.getItem("userName") || "User";

    // Patient viewing mode (for doctors/admins viewing patient dashboard)
    const isViewingPatient = localStorage.getItem("isViewingPatient") === "true";
    const viewingPatientId = localStorage.getItem("viewingPatientId");
    const viewingPatientName = localStorage.getItem("viewingPatientName");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    // ---------- SET WELCOME INFO ----------
    $("#userWelcome").text(`Welcome, ${userName}`);

    // ---------- HANDLE PATIENT VIEWING MODE ----------
    if (isViewingPatient && viewingPatientId && (role === "0" || role === "1")) {
        setupPatientViewingMode();
    } else {
        setupNormalDashboard();
    }

    // ---------- NORMAL DASHBOARD SETUP ----------
    function setupNormalDashboard() {
        console.log("summa");
        // Reset viewing mode UI
        $("#viewingPatientHeader").hide();
        $("#patientInfoTitle").text("My Details");
        $("#historyTitle").text("History");
        $("#patientDashboardSection").hide();
        $("#dashboardSection").show();

        // Role-based menu visibility
        $("#addDoctorMenu, #addPatientMenu, #bookAppointmentMenu, #patientsMenu, #appointmentsMenu, #doctorsMenu, #showHistory").addClass("hidden");

        if (role === "0") { // Admin
            $("#addDoctorMenu, #addPatientMenu, #doctorsMenu, #patientsMenu, #appointmentsMenu, #bookAppointmentMenu").removeClass("hidden");
            $("#dashboardSection").show();
            $("#patientDashboardSection").hide();
            console.log("1");
            loadAdminStats();
            console.log("2");
        } else if (role === "1") { // Doctor
            $("#patientsMenu, #appointmentsMenu, #showHistory").removeClass("hidden");
            $("#dashboardSection").show();
            $("#patientDashboardSection").hide();
            console.log("3");
            loadAdminStats();
            console.log("4");
        } else if (role === "2") { // Patient
            $("#bookAppointmentMenu, #appointmentsMenu, #showHistory").removeClass("hidden");
            $("#dashboardSection").hide();
            $("#patientDashboardSection").show();
            loadPatientDetails();
            loadPatientStats();
            loadPatientHistory();
        }
    }

    // ---------- PATIENT VIEWING MODE ----------
    function setupPatientViewingMode() {
        console.log("summa2");
        $("#viewingPatientHeader").show();
        $("#viewingPatientTitle").text(`Viewing Patient: ${viewingPatientName || "Unknown"}`);
        $("#patientInfoTitle").text("Patient Details");
        $("#historyTitle").text("Patient History");

        $("#dashboardSection").hide();
        $("#patientDashboardSection").show();

        loadPatientDetails(viewingPatientId);
        loadPatientStats(viewingPatientId);
        loadPatientHistory(viewingPatientId);

        $("#backToDashboardBtn").on("click", function () {
            localStorage.removeItem("isViewingPatient");
            localStorage.removeItem("viewingPatientId");
            localStorage.removeItem("viewingPatientName");
            window.location.reload();
        });
    }

    // ---------- API CALLS ----------
    function loadAdminStats() {
    console.log("Loading admin stats with token:", token ? "Present" : "Missing");
    
    $.ajax({
        url: "http://localhost:8080/api/dashboard/stats",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        success: function (res) {
            console.log("Raw response:", res);
            console.log("Doctors:", res.doctors, "Patients:", res.patients, "Appointments:", res.appointments);
            
            $("#doctorsCount").text(res.doctors || 0);
            $("#patientsCount").text(res.patients || 0);
            $("#appointmentsCount").text(res.appointments || 0);
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText, 
                error: error
            });
            
            $("#doctorsCount").text(0);
            $("#patientsCount").text(0);
            $("#appointmentsCount").text(0);
        }
    });
}

    function loadPatientDetails(patientId = null) {
        console.log("Loading patient details for:", patientId);
        $.ajax({
            url: patientId
                ? `http://localhost:8080/appointment/getDetailsforPatient?patientId=${patientId}`
                : "http://localhost:8080/appointment/getDetailsforPatient",
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
    }


      // ✅ Patient Stats (Charts)
    function loadPatientStats(patientId = null) {
console.log("Loading loadPatientStats for:", patientId);
        const url = patientId 
        ? `http://localhost:8080/appointment/getPatientStats?patientId=${patientId}`
        : "http://localhost:8080/appointment/getPatientStats";
        $.ajax({
            url: url,
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

    function loadPatientHistory(patientId = null) {
        console.log("loadPatientHistory for:", patientId);
        const url = patientId 
        ? `http://localhost:8080/appointment/show-History?patientId=${patientId}`
        : "http://localhost:8080/appointment/show-History";

        $.ajax({
            url: url,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            success: function (res) {
                const tbody = $("#historyTableBody");
                tbody.empty();

                if (res.status && res.data && res.data.length) {
                    res.data.forEach((item, index) => {
                        const detailsId = `details-${index}`;
                        const row = `
                            <tr class="main-row" data-target="${detailsId}">
                                <td>${item.appointment_id}</td>
                                <td>${item.doctorName}</td>
                                <td>${item.patientName}</td>
                                <td>${item.appointment_date}</td>
                                <td>${item.appointment_startTime}</td>
                                <td>${item.appointment_endTime}</td>
                                <td><span class="badge bg-success">${item.status}</span></td>
                            </tr>
                            <tr class="details-row" id="${detailsId}" style="display:none;">
                            <td colspan="7">
                                <div class="details-box">
                                <p><span class="fw-bold">Consultation Date:</span> ${item.visit_records?.date || "-"}</p>
                                <p><span class="fw-bold">Reason:</span> ${item.visit_records?.reason || "-"}</p>
                                <p><span class="fw-bold">Weight:</span> ${item.visit_records?.weight || "-"} kg</p>
                                <p><span class="fw-bold">Blood Pressure:</span> ${item.visit_records?.bp_systolic || "-"}/${item.visit_records?.bp_diastolic || "-"} mmHg</p>
                                <p><span class="fw-bold">Doctor Comment:</span> ${item.visit_records?.doctor_comment || "-"}</p>

                                <!-- ✅ Add PDF Download Button -->
                                <button class="btn btn-sm btn-primary downloadPdfBtn mt-2" 
                                    data-appointment='${JSON.stringify(item)
                                    .replace(/'/g, "&apos;")
                                    .replace(/"/g, "&quot;")}'>
                                    <i class="fa-solid fa-file-pdf"></i> Download PDF
                                </button>
                                </div>
                            </td>
                            </tr>
                        `;

                        tbody.append(row);
                    });

                    // Toggle details
                    $(".main-row").on("click", function () {
                        const targetId = $(this).data("target");
                        $("#" + targetId).toggle();
                    });

                    // PDF Download Handler
                    $(".downloadPdfBtn").on("click", async function () {
                        const item = JSON.parse($(this).attr("data-appointment").replace(/&quot;/g, '"').replace(/&apos;/g, "'"));

                        const { jsPDF } = window.jspdf;
                        const doc = new jsPDF();
                        const lineHeight = 10;
                        let y = 20;

                        // Title
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(18);
                        doc.text("Appointment Details", 105, y, { align: "center" });
                        y += 15;

                        // Draw info box
                        doc.setDrawColor(100, 149, 237);
                        doc.roundedRect(10, y - 5, 190, 90, 5, 5);

                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(12);
                        y += 10;
                        doc.text(`Appointment ID: ${item.appointment_id}`, 20, y); y += lineHeight;
                        doc.text(`Doctor: ${item.doctorName}`, 20, y); y += lineHeight;
                        doc.text(`Patient: ${item.patientName}`, 20, y); y += lineHeight;
                        doc.text(`Date: ${item.appointment_date}`, 20, y); y += lineHeight;
                        doc.text(`Start Time: ${item.appointment_startTime}`, 20, y); y += lineHeight;
                        doc.text(`End Time: ${item.appointment_endTime}`, 20, y); y += lineHeight;
                        doc.text(`Status: ${item.status}`, 20, y); y += 15;

                        doc.setFont("helvetica", "bold");
                        doc.text("Visit Record", 20, y);
                        y += 10;

                        doc.setFont("helvetica", "normal");
                        doc.text(`Consultation Date: ${item.visit_records?.date || "-"}`, 20, y); y += lineHeight;
                        doc.text(`Reason: ${item.visit_records?.reason || "-"}`, 20, y); y += lineHeight;
                        doc.text(`Weight: ${item.visit_records?.weight || "-"} kg`, 20, y); y += lineHeight;
                        doc.text(`Blood Pressure: ${item.visit_records?.bp_systolic || "-"}/${item.visit_records?.bp_diastolic || "-"} mmHg`, 20, y); y += lineHeight;
                        doc.text(`Doctor Comment: ${item.visit_records?.doctor_comment || "-"}`, 20, y); y += lineHeight;

                        // Footer
                        y += 20;
                        doc.setFontSize(10);
                        doc.text("Generated by ABC Hospital Portal", 105, y, { align: "center" });

                        // Download PDF
                        const filename = `Appointment_${item.appointment_id}.pdf`;
                        doc.save(filename);
                    });

                } else {
                    tbody.append(`<tr><td colspan="7" class="text-center text-muted">No history available</td></tr>`);
                }
            }
        });
    }


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
                if (role === "1") $("#roleSpecificField").html(`<label>Expertise</label><input type="text" id="editExpertise" value="${user.expertise || ""}">`);
                if (role === "2") $("#roleSpecificField").html(`<label>Problem</label><input type="text" id="editProblem" value="${user.problem || ""}">`);
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

