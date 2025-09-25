$(document).ready(function () {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "index.html"; return; }

  // helpers
  function formatSqlTimeTo12(sqlTime) {
    // input "HH:MM:SS" or "HH:MM"
    if (!sqlTime) return "";
    const parts = sqlTime.split(':');
    let hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour}:${minute} ${ampm}`;
  }

  function sqlTimeToHtmlTime(sqlTime) {
    // convert "HH:MM:SS" -> "HH:MM" (24h) suitable for <input type="time">
    if (!sqlTime) return "";
    const parts = sqlTime.split(':');
    return `${parts[0].padStart(2,'0')}:${(parts[1]||'00').padStart(2,'0')}`;
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
          // prepare displayed times (12h) and input-times (HH:MM)
          const start12 = formatSqlTimeTo12(a.Appointment_startTime);
          const end12   = formatSqlTimeTo12(a.Appointment_endTime);
          const startInput = sqlTimeToHtmlTime(a.Appointment_startTime); // for prefill

// Safely get status
const statusValue = (a.status ?? "").toLowerCase(); // fallback to empty string if undefined

let actionButtons = "";
if (statusValue === "completed") {
    actionButtons = `<span class="completed-label">Completed</span>`;
} else {
    actionButtons = `
      <button class="btn-complete" data-id="${a.id}">Complete</button>
      <button class="btn-reschedule"
              data-id="${a.id}"
              data-date="${a.Appointment_date}"
              data-time="${startInput}">Reschedule</button>
    `;
}

// Update status cell safely
const statusText = a.status || "Unknown";

    tbody.append(`
      <tr>
        <td>${a.id}</td>
        <td>${escapeHtml(a.DoctorName || '')}</td>
        <td>${escapeHtml(a.PatientName || '')}</td>
        <td>${a.Appointment_date || ''}</td>
        <td>${start12}</td>
        <td>${end12}</td>
        <td><span class="status ${statusValue}">${statusText}</span></td>
        <td class="actions">${actionButtons}</td>
      </tr>
    `);

        });
      } else {
        tbody.append(`<tr><td colspan="8" style="text-align:center;">No appointments found</td></tr>`);
      }
    },
    error: function (xhr) {
      alert("Failed to load appointments.");
      console.error(xhr);
    }
  });
}

// make sure filter triggers reload
$("#searchBox, #filterDate, #filterStatus, #filterRange, #filterAppointmentId").on("input change", function () {
  loadAppointments();
});



  // small utility to avoid injection when rendering names
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"'`=\/]/g, function (c) {
      return {
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#47;','=':'&#61;','`':'&#96;'
      }[c];
    });
  }

  loadAppointments();

  // ---------- COMPLETE APPOINTMENT ----------
$(document).on("click", ".btn-complete", function () {
    const id = $(this).data("id");
    if (!id) { alert("Missing appointment id"); return; }
    window.location.href = `completeAppointment.html?appointmentId=${id}`;
});

  // ---------- OPEN RESCHEDULE MODAL ----------
  // now reads data-* attributes (id, date, time) from the table button
  $(document).on("click", ".btn-reschedule", function() {
    const appointmentId = $(this).data("id");
    const appointmentDate = $(this).data("date");   // yyyy-mm-dd
    const appointmentTime = $(this).data("time");   // HH:MM suitable for <input type=time>

    if (!appointmentId) {
      alert("Cannot reschedule: missing appointment id.");
      return;
    }

    // fill hidden id + prefill date/time if available
    $("#rescheduleAppointmentId").val(appointmentId);

    if (appointmentDate) {
      $("#rescheduleDate").val(appointmentDate);
    } else {
      $("#rescheduleDate").val('');
    }

    if (appointmentTime) {
      $("#rescheduleTime").val(appointmentTime);
    } else {
      $("#rescheduleTime").val('');
    }

    // show modal
    $("#rescheduleModal").css("display", "flex");
  });

  // ---------- SUBMIT RESCHEDULE ----------
  $("#rescheduleForm").on("submit", function(e) {
    e.preventDefault();

    const id = $("#rescheduleAppointmentId").val();
    const date = $("#rescheduleDate").val();
    const time24 = $("#rescheduleTime").val();
    const reason = $("#rescheduleReason").val();

    if (!id || !date || !time24 || !reason) {
      alert("Please fill all fields.");
      return;
    }

    // Convert time input (HH:mm) -> "h:mm AM/PM"
    function to12HourFormat(time24) {
      const [h, m] = time24.split(":");
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 === 0 ? 12 : hour % 12;
      return `${hour}:${m} ${ampm}`;
    }

    const formattedTime = to12HourFormat(time24);

    console.log("reschedule payload:", { formattedTime, date, id, reason });

    $.ajax({
      url: "http://localhost:8080/appointment/Reschedule-appointment",
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data: {
        appointment_id: id,
        newAppointmentDate: date,
        newAppointmentstartTime: formattedTime,
        reschedule_reason: reason
      },
      success: function(res) {
        if (res.status) {
          alert("Appointment rescheduled successfully.");
          $("#rescheduleModal").hide();
          loadAppointments();
        } else {
          alert(res.Mssge || res.Error || "Failed to reschedule appointment.");
          console.warn("Reschedule response:", res);
        }
      },
      error: function(xhr) {
        alert("Failed to reschedule appointment. " + xhr.responseText);
        console.error(xhr);
      }
    });
  });

  // ---------- CANCEL RESCHEDULE ----------
  // If you have a button to cancel, wire it. Otherwise user can click X
  $(document).on("click", "#cancelRescheduleBtn", function () {
    $("#rescheduleModal").hide();
  });

  // ---------- BOOK APPOINTMENT ----------
  $("#bookAppointmentBtn").click(function () {
    window.location.href = "bookAppointment.html";
  });

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
    xhrFields: { responseType: "blob" },
    success: function (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "appointments.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: function () { 
      alert("Failed to export appointments."); 
    }
  });
});

  // ---------- FILTER + SEARCH ----------
  $("#searchBox, #filterDate, #filterStatus, #filterRange, #filterAppointmentId").on("input change", function () {
  loadAppointments();
});


  // ---------- BACK BUTTON ----------
  // if you have #backBtn element
  $(document).on("click", "#backBtn", function () { window.location.href = "http://localhost:8080/dashboard.html"; });
});
