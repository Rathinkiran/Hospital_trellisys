$(document).ready(function () {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName") || "Patient";

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    // Optional: hospital filter
    let hospitalId = null;
    $("#hospitalFilter").on("change", function () {
        hospitalId = $(this).val() || null;
        fetchHistory();
    });

    fetchHistory();

    function fetchHistory() {
        const url = hospitalId
            ? `http://localhost:8080/appointment/show-History?hospital_id=${hospitalId}`
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
                        const patientName = item.patientName || userName;
                        const hospitalName = item.HospitalName || "-";

                        const row = `
                        <tr class="main-row" data-target="${detailsId}">
                            <td>${item.appointment_id}</td>
                            <td>${item.doctorName}</td>
                            <td>${patientName}</td>
                            <td>${hospitalName}</td>
                            <td>${item.appointment_date}</td>
                            <td>${item.appointment_startTime}</td>
                            <td>${item.appointment_endTime}</td>
                            <td><span class="badge bg-success">${item.status}</span></td>
                        </tr>
                        <tr class="details-row" id="${detailsId}" style="display:none;">
                            <td colspan="8">
                                <div class="details-box">
                                    <p><span class="fw-bold">Hospital:</span> ${hospitalName}</p>
                                    <p><span class="fw-bold">Contact:</span> ${item.Hospital_contactNo || "-"}</p>
                                    <p><span class="fw-bold">Address:</span> ${item.Hospital_address || "-"}</p>
                                    <p><span class="fw-bold">Consultation Date:</span> ${item.visit_records?.date || "-"}</p>
                                    <p><span class="fw-bold">Reason:</span> ${item.visit_records?.reason || "-"}</p>
                                    <p><span class="fw-bold">Weight:</span> ${item.visit_records?.weight || "-"} kg</p>
                                    <p><span class="fw-bold">Blood Pressure:</span> ${item.visit_records?.bp_systolic || "-"}/${item.visit_records?.bp_diastolic || "-"} mmHg</p>
                                    <p><span class="fw-bold">Doctor Comment:</span> ${item.visit_records?.doctor_comment || "-"}</p>
                                    <button class="btn btn-sm btn-primary downloadPdfBtn mt-2" 
                                        data-appointment='${JSON.stringify(item).replace(/'/g, "&apos;").replace(/"/g, "&quot;")}'
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

                    // Download PDF
                    $(".downloadPdfBtn").on("click", function () {
                        const item = JSON.parse($(this).attr("data-appointment")
                            .replace(/&quot;/g, '"').replace(/&apos;/g, "'"));
                        const { jsPDF } = window.jspdf;
                        const doc = new jsPDF();
                        let y = 20;

                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(18);
                        doc.text("Appointment Details", 105, y, { align: "center" });
                        y += 15;

                        doc.setDrawColor(100, 149, 237);
                        doc.roundedRect(10, y - 5, 190, 110, 5, 5);
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(12);
                        y += 10;

                        doc.text(`Appointment ID: ${item.appointment_id}`, 20, y); y += 10;
                        doc.text(`Doctor: ${item.doctorName}`, 20, y); y += 10;
                        doc.text(`Patient: ${item.patientName}`, 20, y); y += 10;
                        doc.text(`Hospital: ${item.HospitalName}`, 20, y); y += 10;
                        doc.text(`Contact: ${item.Hospital_contactNo || "-"}`, 20, y); y += 10;
                        doc.text(`Address: ${item.Hospital_address || "-"}`, 20, y); y += 10;
                        doc.text(`Date: ${item.appointment_date}`, 20, y); y += 10;
                        doc.text(`Start Time: ${item.appointment_startTime}`, 20, y); y += 10;
                        doc.text(`End Time: ${item.appointment_endTime}`, 20, y); y += 10;
                        doc.text(`Status: ${item.status}`, 20, y); y += 10;

                        doc.setFont("helvetica", "bold");
                        doc.text("Visit Record", 20, y); y += 10;
                        doc.setFont("helvetica", "normal");
                        doc.text(`Consultation Date: ${item.visit_records?.date || "-"}`, 20, y); y += 10;
                        doc.text(`Reason: ${item.visit_records?.reason || "-"}`, 20, y); y += 10;
                        doc.text(`Weight: ${item.visit_records?.weight || "-"} kg`, 20, y); y += 10;
                        doc.text(`Blood Pressure: ${item.visit_records?.bp_systolic || "-"}/${item.visit_records?.bp_diastolic || "-"} mmHg`, 20, y); y += 10;
                        doc.text(`Doctor Comment: ${item.visit_records?.doctor_comment || "-"}`, 20, y); y += 10;

                        y += 20;
                        doc.setFontSize(10);
                        doc.text("Generated by ABC Hospital Portal", 105, y, { align: "center" });

                        doc.save(`Appointment_${item.appointment_id}.pdf`);
                    });

                } else {
                    tbody.html(`<tr><td colspan="8" class="text-center text-muted">No history available</td></tr>`);
                }
            },
            error: function () {
                alert("Failed to fetch history");
            }
        });
    }
});
