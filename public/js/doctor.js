$(document).ready(function () {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "index.html"; return; }

  // ---------- LOAD DOCTORS ----------
  function loadDoctors() {
    $.ajax({
      url: "http://localhost:8080/api/list-Doctors",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        const tbody = $("#doctorsTable tbody");
        tbody.empty();
        const doctors = res.data || [];
        if (doctors.length > 0) {
          doctors.forEach(doc => {
            tbody.append(`
              <tr>
                <td>${doc.name}</td>
                <td>${doc.gender}</td>
                <td>${doc.expertise || ""}</td>
                <td>${doc.email}</td>
                <td>
                  <button class="btn-edit" data-id="${doc.id}">Edit</button>
                  <button class="btn-delete" data-id="${doc.id}">Delete</button>
                </td>
              </tr>
            `);
          });
        } else {
          tbody.append(`<tr><td colspan="5" style="text-align:center;">No doctors found</td></tr>`);
        }
      },
      error: function () { alert("Failed to load doctors."); }
    });
  }
  loadDoctors();

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
  $("#backBtn").click(function () { window.location.href = "http://localhost:8080/dashboard.html"; });
});
