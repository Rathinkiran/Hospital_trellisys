$(document).ready(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "2"; // 0=Admin,1=Doctor,2=Patient
  if (!token) { window.location.href = "index.html"; return; }

  // Setup table headers based on role
  if (role === "2") 
  {
    $("#appointmentsHeader").html(`
      <th>ID</th>
      <th>Doctor</th>
      <th>Patient</th>
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

    let query = [];
    if (search) query.push(`search=${encodeURIComponent(search)}`);
    if (filterDate) query.push(`date=${filterDate}`);
    if (filterStatus) query.push(`status=${filterStatus}`);
    if (filterRange) query.push(`dateFilter=${filterRange}`);
    if (filterAppointmentId) query.push(`appointmentId=${filterAppointmentId}`);

    $.ajax({
      url: `http://localhost:8080/appointment/List-appointments${query.length ? "?" + query.join("&") : ""}`,
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
                console.log("The patient id is " , a.patient_id);              }
              row += `<td class="actions">${actionButtons}</td>`;
            }

            row += `</tr>`;
            tbody.append(row);
          });
        } else {
          tbody.append(`<tr><td colspan="${role==='2' ? 7 : 8}" style="text-align:center;">No appointments found</td></tr>`);
        }
      },
      error: function (xhr) {
        alert("Failed to load appointments.");
        console.error(xhr);
      }
    });
  }

  $("#searchBox, #filterDate, #filterStatus, #filterRange, #filterAppointmentId").on("input change", loadAppointments);

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
        else { alert(res.Mssge || "Failed to cancel"); }
      },
      error: function(xhr){ alert("Failed to cancel appointment. "+xhr.responseText); }
    });
  });

  // ---------- SHOW PATIENT HISTORY ----------
  $(document).on("click", ".btn-history", function () {
    const patientId = $(this).data("patient-id");  // ✅ Change to kebab-case
    const patientName = $(this).data("patient-name");
    console.log("patientId is " , patientId);
    console.log("patientName is " , patientName);
    
    if (!patientId) {
      alert("Patient ID not available");
      return;
    }
    
    // Store patient info in localStorage to use on dashboard
    localStorage.setItem("viewingPatientId", patientId);
    localStorage.setItem("viewingPatientName", patientName);
    localStorage.setItem("isViewingPatient", "true");
    
    // Redirect to dashboard which will show patient history
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
    let query = [];
    if (search) query.push(`search=${encodeURIComponent(search)}`);
    if (filterDate) query.push(`date=${filterDate}`);
    if (filterStatus) query.push(`status=${filterStatus}`);
    if (filterRange) query.push(`dateFilter=${filterRange}`);
    if (filterAppointmentId) query.push(`appointmentId=${filterAppointmentId}`);
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