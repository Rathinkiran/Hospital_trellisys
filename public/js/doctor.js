$(document).ready(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // 0=Admin, 3=SuperAdmin
  const hospital_id = localStorage.getItem("hospital_id");
  if (!token) { window.location.href = "index.html"; return; }

  // Hide doctors section for doctors/patients
  if (role === "1" || role === "2") {
    alert("Access Denied!");
    window.location.href = "dashboard.html";
    return;
  }

  // If SuperAdmin → show hospital filter
  if (role === "3") {
    $("#hospitalFilterRow").show();
    $("#hospitalHeader").show();

    // Fetch all hospitals
    $.ajax({
      url: "http://localhost:8080/hospital/list-all-Hospitals",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        if (res.status && res.data) {
          res.data.forEach(h => {
            $("#filterHospital").append(`<option value="${h.id}">${h.name}</option>`);
          });
        }
      },
      error: function () { console.error("Failed to fetch hospitals"); }
    });
  }

  // ---------- LOAD DOCTORS ----------
  function loadDoctors() {
    let apiUrl = "";
    let dataParams = {};

    if (role === "3") {
      apiUrl = "http://localhost:8080/api/list-Doctors-for-SuperAdmin";
      const selectedHospital = $("#filterHospital").val();
      if (selectedHospital) dataParams.hospital_id = selectedHospital;
    } else if (role === "0") {
      apiUrl = "http://localhost:8080/api/list-Doctors-Hospital-Wise";
      dataParams.hospital_id = hospital_id;
    } else {
      apiUrl = "http://localhost:8080/api/list-Doctors";
    }

    $.ajax({
      url: apiUrl,
      method: "GET",
      data: dataParams,
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        const tbody = $("#doctorsTable tbody");
        tbody.empty();
        const doctors = res.data || [];
        if (doctors.length > 0) {
          doctors.forEach(doc => {
            const hospitalName = doc.HospitalName || (role === "3" ? (doc.hospitalName || "—") : "");
            tbody.append(`
              <tr>
                <td>${doc.name}</td>
                <td>${doc.gender}</td>
                <td>${doc.expertise || ""}</td>
                <td>${doc.email}</td>
                ${role === "3" ? `<td>${hospitalName}</td>` : ""}
                <td>
                  <button class="btn-edit" data-id="${doc.id}">Edit</button>
                  <button class="btn-delete" data-id="${doc.id}">Delete</button>
                </td>
              </tr>
            `);
          });
        } else {
          const colSpan = role === "3" ? 6 : 5;
          tbody.append(`<tr><td colspan="${colSpan}" style="text-align:center;">No doctors found</td></tr>`);
        }
      },
      error: function () { alert("Failed to load doctors."); }
    });
  }
  loadDoctors();

  // Re-load doctors when hospital filter changes (only for SuperAdmin)
  $("#filterHospital").on("change", loadDoctors);

  // ---------- DELETE DOCTOR ----------
  $(document).on("click", ".btn-delete", function () {
    const doctorId = $(this).data("id");
    if (confirm("Are you sure you want to delete this doctor?")) {
      $.ajax({
        url: `http://localhost:8080/api/Delete-Doctor`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        data: { doctorId, _method: "DELETE" },
        success: function () {
          alert("Doctor deleted successfully.");
          loadDoctors();
        },
        error: function () { alert("Failed to delete doctor."); }
      });
    }
  });

  // ---------- EDIT DOCTOR ----------
  $(document).on("click", ".btn-edit", function () {
    const doctorId = $(this).data("id");
    $.ajax({
      url: `http://localhost:8080/api/user/${doctorId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        const doc = res.data;
        $("#editDoctorId").val(doc.id);
        $("#editName").val(doc.name);
        $("#editGender").val(doc.gender);
        $("#editExpertise").val(doc.expertise || "");
        $("#editEmail").val(doc.email);
        $("#editModal").css("display", "flex");
      },
      error: function () { alert("Failed to fetch doctor details."); }
    });
  });

  // ---------- SAVE EDIT ----------
  $("#saveEditBtn").click(function () {
    const data = {
      doctorId: $("#editDoctorId").val(),
      name: $("#editName").val(),
      gender: $("#editGender").val(),
      expertise: $("#editExpertise").val(),
      email: $("#editEmail").val()
    };
    $.ajax({
      url: "http://localhost:8080/api/Edit-Doctor",
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data,
      success: function (res) {
        alert(res.mssge);
        $("#editModal").hide();
        loadDoctors();
      },
      error: function () { alert("Failed to update doctor."); }
    });
  });

  // ---------- CANCEL EDIT ----------
  $("#cancelEditBtn").click(function () { $("#editModal").hide(); });

  // ---------- ADD DOCTOR ----------
  $("#addDoctorBtn").click(function () { window.location.href = "addDoctor.html"; });

  // ---------- BACK BUTTON ----------
  $("#backBtn").click(function () { window.location.href = "dashboard.html"; });
});
