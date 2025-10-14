$(document).ready(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "2"; // 0=Admin,1=Doctor,2=Patient
  if (!token) { window.location.href = "index.html"; return; }

  // Show hospital filter for patient & superAdmin
  if(role === "2" || role === "3") {
    $("#filterHospital").show();
    // Fetch all hospitals
    $.ajax({
      url: "http://localhost:8080/hospital/list-all-Hospitals",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function(res) {
        if(res.status && res.data) {
          res.data.forEach(h => {
            $("#filterHospital").append(`<option value="${h.id}">${h.name}</option>`);
          });
        }
      },
      error: function(){ console.error("Failed to fetch hospitals"); }
    });
  }

  // Setup table headers based on role
  if (role === "2") {
    $("#appointmentsHeader").html(`
      <th>ID</th>
      <th>Doctor</th>
      <th>Patient</th>
      <th>Hospital</th>
      <th>Date</th>
      <th>Start Time</th>
      <th>End Time</th>
      <th>Status</th>
    `);
  } else {
    $("#appointmentsHeader").html(`
      <th>ID</th>
      <th>Doctor</th>
      <th>Patient</th>
      <th>Hospital</th>
      <th>Date</th>
      <th>Start Time</th>
      <th>End Time</th>
      <th>Status</th>
      <th>Actions</th>
    `);
  }

  // ---------- HELPERS ----------
  function formatSqlTimeTo12(sqlTime) {
    if (!sqlTime) return "";
    const [h, m] = sqlTime.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour}:${m} ${ampm}`;
  }

  function sqlTimeToHtmlTime(sqlTime) {
    if (!sqlTime) return "";
    const parts = sqlTime.split(":");
    return `${parts[0].padStart(2,'0')}:${(parts[1]||'00').padStart(2,'0')}`;
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"'`=\/]/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#47;','=':'&#61;','`':'&#96;'}[c])
    );
  }

  // ---------- LOAD APPOINTMENTS ----------
  function loadAppointments() {
    const search = $("#searchBox").val().trim();
    const filterDate = $("#filterDate").val();
    const filterStatus = $("#filterStatus").val();
    const filterRange = $("#filterRange").val();
    const filterAppointmentId = $("#filterAppointmentId").val().trim();
    const filterHospital = $("#filterHospital").val();

    let query = [];
    if (search) query.push(`search=${encodeURIComponent(search)}`);
    if (filterDate) query.push(`date=${filterDate}`);
    if (filterStatus) query.push(`status=${filterStatus}`);
    if (filterRange) query.push(`dateFilter=${filterRange}`);
    if (filterAppointmentId) query.push(`appointmentId=${filterAppointmentId}`);
    if (filterHospital) query.push(`hospital_id=${filterHospital}`);

    let apiUrl = "http://localhost:8080/appointment/";
    if(role === "2") apiUrl += "List-appointments-for-Patients";
    else if(role === "3") apiUrl += "List-appointments-for-SuperAdmins";
    else if(role === "1" || role === "0") apiUrl += "List-appointments-for-Doctors-and-Admins";
    else apiUrl += "List-appointments-for-Doctors-and-Admins";

    $.ajax({
      url: `${apiUrl}${query.length ? "?" + query.join("&") : ""}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        const tbody = $("#appointmentsTable tbody");
        tbody.empty();
        const appts = res.data || [];
        if (appts.length > 0) {
          appts.forEach(a => {
            const start12 = formatSqlTimeTo12(a.Appointment_startTime);
            const end12   = formatSqlTimeTo12(a.Appointment_endTime);
            const startInput = sqlTimeToHtmlTime(a.Appointment_startTime);
            const statusValue = (a.status ?? "").toLowerCase();
            const statusText = a.status || "Unknown";

            let row = `
              <tr>
                <td>${a.id}</td>
                <td>${escapeHtml(a.DoctorName || '')}</td>
                <td>${escapeHtml(a.PatientName || '')}</td>
                <td>${escapeHtml(a.HospitalName || '')}</td>
                <td>${a.Appointment_date || ''}</td>
                <td>${start12}</td>
                <td>${end12}</td>
                <td><span class="status ${statusValue}">${statusText}</span></td>
            `;

            if (role !== "2") {
              let actionButtons = "";
              if (statusValue === "completed" || statusValue === "rescheduled" || statusValue === "cancelled") {
                actionButtons = `<span class="inactive-status">${statusText}</span>`;
              } else if (statusValue === "booked") {
                actionButtons = `
                  <button class="btn-complete" data-id="${a.id}">Complete</button>
                  <button class="btn-reschedule" data-id="${a.id}" data-date="${a.Appointment_date}" data-time="${startInput}">Reschedule</button>
                  <button class="btn-cancel" data-id="${a.id}">Cancel</button>
                  <button class="btn-history" data-patient-id="${a.patient_id}" data-patient-name="${escapeHtml(a.PatientName || '')}">Show Patient History</button>
                `;
              }
              row += `<td class="actions">${actionButtons}</td>`;
            }

            row += `</tr>`;
            tbody.append(row);
          });
        } else {
          tbody.append(`<tr><td colspan="${role==='2' ? 8 : 9}" style="text-align:center;">No appointments found</td></tr>`);
        }
      },
      error: function (xhr) { alert("Failed to load appointments."); console.error(xhr); }
    });
  }

  $("#searchBox, #filterDate, #filterStatus, #filterRange, #filterAppointmentId, #filterHospital").on("input change", loadAppointments);
  loadAppointments();

  // ---------- COMPLETE ----------
  $(document).on("click", ".btn-complete", function () {
    const id = $(this).data("id");
    if (!id) return;
    window.location.href = `completeAppointment.html?appointmentId=${id}`;
  });

  // ---------- RESCHEDULE ----------
  $(document).on("click", ".btn-reschedule", function () {
    const id = $(this).data("id");
    const date = $(this).data("date");
    const time = $(this).data("time");
    $("#rescheduleAppointmentId").val(id);
    $("#rescheduleDate").val(date || "");
    $("#rescheduleTime").val(time || "");
    $("#rescheduleModal").css("display","flex");
  });

  $("#rescheduleForm").on("submit", function(e) {
    e.preventDefault();
    const id = $("#rescheduleAppointmentId").val();
    const date = $("#rescheduleDate").val();
    const time24 = $("#rescheduleTime").val();
    const reason = $("#rescheduleReason").val();
    if (!id || !date || !time24 || !reason) { alert("Please fill all fields."); return; }
    const [h,m] = time24.split(":");
    let hour = parseInt(h,10); const ampm = hour>=12?"PM":"AM";
    hour = hour%12===0?12:hour%12;
    const formattedTime = `${hour}:${m} ${ampm}`;
    $.ajax({
      url: "http://localhost:8080/appointment/Reschedule-appointment",
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data: { appointment_id:id, newAppointmentDate:date, newAppointmentstartTime:formattedTime, reschedule_reason:reason },
      success: function(res){ if(res.status){ alert("Appointment rescheduled."); $("#rescheduleModal").hide(); loadAppointments(); } else alert(res.Mssge||"Failed"); },
      error: function(xhr){ alert("Failed to reschedule. "+xhr.responseText); }
    });
  });

  // ---------- CANCEL ----------
  $(document).on("click", ".btn-cancel", function () {
    const id = $(this).data("id");
    if (!confirm("Cancel this appointment?")) return;
    $.ajax({
      url: "http://localhost:8080/api/cancel-Appointment",
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data: { appointmentId: id },
      success: function(res){ 
        if(res.status){ alert("Appointment cancelled."); loadAppointments(); }
        else { alert(res.Mssge || "Failed"); }
      },
      error: function(xhr){ alert("Failed to cancel appointment. "+xhr.responseText); }
    });
  });

  // ---------- SHOW PATIENT HISTORY ----------
  $(document).on("click", ".btn-history", function () {
    const patientId = $(this).data("patient-id");
    const patientName = $(this).data("patient-name");
    if (!patientId) { alert("Patient ID not available"); return; }
    localStorage.setItem("viewingPatientId", patientId);
    localStorage.setItem("viewingPatientName", patientName);
    localStorage.setItem("isViewingPatient", "true");
    window.location.href = "dashboard.html";
  });

  // ---------- BOOK ----------
  $("#bookAppointmentBtn").click(() => window.location.href="bookAppointment.html");

  // ---------- EXPORT CSV ----------
  $("#exportCSV").click(function () {
    const search = $("#searchBox").val().trim();
    const filterDate = $("#filterDate").val();
    const filterStatus = $("#filterStatus").val();
    const filterRange = $("#filterRange").val();
    const filterAppointmentId = $("#filterAppointmentId").val().trim();
    const filterHospital = $("#filterHospital").val();

    let query = [];
    if (search) query.push(`search=${encodeURIComponent(search)}`);
    if (filterDate) query.push(`date=${filterDate}`);
    if (filterStatus) query.push(`status=${filterStatus}`);
    if (filterRange) query.push(`dateFilter=${filterRange}`);
    if (filterAppointmentId) query.push(`appointmentId=${filterAppointmentId}`);
    if (filterHospital) query.push(`hospital_id=${filterHospital}`);

    const url = `http://localhost:8080/appointment/export-csv${query.length ? "?" + query.join("&") : ""}`;
    $.ajax({
      url: url,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      xhrFields: { responseType:"blob" },
      success: function (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href=url; a.download="appointments.csv"; a.click();
        window.URL.revokeObjectURL(url);
      },
      error: function(){ alert("Failed to export appointments."); }
    });
  });
});
