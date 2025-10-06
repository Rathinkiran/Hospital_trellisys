$(document).ready(function () {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName") || "Patient";

    if (!token) {
        window.location.href = "index.html";
    }

    // Fetch patient history
    $.ajax({
        url: "http://localhost:8080/appointment/show-History",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        success: function (res) {
            if (res.status && res.data && res.data.length) {
                const tableBody = $("#historyTableBody");
                tableBody.empty();

                res.data.forEach((item, index) => {
                    const bookedDate = item.appointment_startTime.split(" ")[0] || "";
                    const patientName = userName; // current logged-in patient
                    const detailsId = `details-${index}`;

                    // Main row
                    const row = `
                        <tr class="main-row" data-target="${detailsId}">
                            <td>${item.appointment_id}</td>
                            <td>${item.doctorName}</td>
                            <td>${patientName}</td>
                            <td>${item.appointment_date}</td>
                            <td>${item.appointment_startTime}</td>
                            <td>${item.appointment_endTime}</td>
                            <td><span class="badge bg-success">${item.status}</span></td>
                        </tr>
                        <tr class="details-row" id="${detailsId}">
                          <td colspan="7">
                            <div class="details-box">
                              <p><span class="fw-bold">Consultation Date:</span> ${item.visit_records.date}</p>
                              <p><span class="fw-bold">Reason:</span> ${item.visit_records.reason}</p>
                              <p><span class="fw-bold">Weight:</span> ${item.visit_records.weight} kg</p>
                              <p><span class="fw-bold">Blood Pressure:</span> ${item.visit_records.bp_systolic}/${item.visit_records.bp_diastolic} mmHg</p>
                              <p><span class="fw-bold">Doctor Comment:</span> ${item.visit_records.doctor_comment}</p>
                            </div>
                          </td>
                        </tr>
                    `;

                    tableBody.append(row);
                });

                // Toggle details on row click
                $(".main-row").on("click", function () {
                    const targetId = $(this).data("target");
                    $("#" + targetId).toggle();
                });
            } else {
                $("#historyTableBody").html(`
                    <tr><td colspan="7" class="text-center text-muted">No history available</td></tr>
                `);
            }
        },
        error: function () {
            alert("Failed to fetch history");
        }
    });
});
