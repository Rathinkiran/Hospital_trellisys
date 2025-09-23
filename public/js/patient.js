$(document).ready(function () {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "index.html"; return; }

  // ---------- LOAD PATIENTS ----------
  function loadPatients() {
    $.ajax({
      url: "http://localhost:8080/api/list-Patients",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        const tbody = $("#patientsTable tbody");
        tbody.empty();
        const patients = res.data || [];
        if (patients.length > 0) {
          patients.forEach(p => {
            tbody.append(`
              <tr>
                <td>${p.name}</td>
                <td>${p.gender}</td>
                <td>${p.problem}</td>
                <td>${p.email}</td>
                <td>
                  <button class="btn-edit" data-id="${p.id}">Edit</button>
                  <button class="btn-delete" data-id="${p.id}">Delete</button>
                </td>
              </tr>
            `);
          });
        } else {
          tbody.append(`<tr><td colspan="5" style="text-align:center;">No patients found</td></tr>`);
        }
      },
      error: function () { alert("Failed to load patients."); }
    });
  }
  loadPatients();

  // ---------- DELETE PATIENT ----------
  $(document).on("click", ".btn-delete", function () {
    const patientId = $(this).data("id");
    if (confirm("Are you sure you want to delete this patient?")) {
      $.ajax({
        url: "http://localhost:8080/api/Delete-Patient",
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        data: { patientId, _method: "DELETE" },
        success: function () {
          alert("Patient deleted successfully.");
          loadPatients();
        },
        error: function () { alert("Failed to delete patient."); }
      });
    }
  });

  // ---------- EDIT PATIENT ----------
  $(document).on("click", ".btn-edit", function () {
    const patientId = $(this).data("id");
    $.ajax({
      url: `http://localhost:8080/api/user/${patientId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        const p = res.data;
        $("#editPatientId").val(p.id);
        $("#editName").val(p.name);
        $("#editGender").val(p.gender);
        $("#editProblem").val(p.problem);
        $("#editEmail").val(p.email);
        $("#editModal").css("display", "flex");
      },
      error: function () { alert("Failed to fetch patient details."); }
    });
  });

  // ---------- SAVE EDIT ----------
  $("#saveEditBtn").click(function () {
    const data = {
      patientId: $("#editPatientId").val(),
      name: $("#editName").val(),
      gender: $("#editGender").val(),
      problem: $("#editProblem").val(),
      email: $("#editEmail").val()
    };
    $.ajax({
      url: `http://localhost:8080/api/Edit-Patient`,
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data,
      success: function (res) {
        alert(res.mssge);
        $("#editModal").hide();
        loadPatients();
      },
      error: function () { alert("Failed to update patient."); }
    });
  });

  // ---------- CANCEL EDIT ----------
  $("#cancelEditBtn").click(function () { $("#editModal").hide(); });

  // ---------- ADD PATIENT ----------
  $("#addPatientBtn").click(function () { window.location.href = "addPatient.html"; });

  // ---------- BACK BUTTON ----------
  $("#backBtn").click(function () { window.location.href = "http://localhost:8080/dashboard.html"; });
});
