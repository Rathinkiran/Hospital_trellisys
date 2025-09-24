$(document).ready(function () {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "index.html"; return; }

    // Retrieve appointment ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get('appointmentId');
    if (!appointmentId) {
        alert("Missing appointment ID");
        window.location.href = "appointments.html";
    }
    $("#appointmentId").val(appointmentId);

    // Optional: Fetch appointment details (like patient name/date) if API exists
    // $.ajax({ ... });

    $("#completeAppointmentForm").on("submit", function (e) {
        e.preventDefault();
        const data = {
            appointment_id: $("#appointmentId").val(),
            reason: $("#reason").val().trim(),
            weight: $("#weight").val().trim(),
            bp_systolic: $("#bp_systolic").val().trim(),
            bp_diastolic: $("#bp_diastolic").val().trim(),
            doctor_comment: $("#doctor_comment").val().trim()
        };
        console.log(appointmentId);

        // Simple validation
        for (let key in data) {
            if (!data[key]) { alert("Please fill all fields"); return; }
        }

        $.ajax({
            url: "http://localhost:8080/appointment/complete-Appointment",
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            data: data,
            success: function (res) {
                if (res.status) {
                    alert(res.Mssge || "Appointment completed successfully");
                    window.location.href = "appointments.html";
                } else {
                    alert(res.Mssge || res.Error || "Failed to complete appointment");
                }
            },
            error: function (xhr) {
                alert("Error completing appointment. Check console.");
                console.error(xhr);
            }
        });
    });
});
