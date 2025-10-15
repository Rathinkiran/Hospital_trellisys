$(document).ready(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // 0=Admin, 1=Doctor, 2=Patient, 3=SuperAdmin
  const hospital_id = localStorage.getItem("hospital_id");
  const selectedHospitalFromHospitals = localStorage.getItem("selectedHospitalId");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  // Restrict access for patients
  if (role === "2") {
    alert("Access Denied!");
    window.location.href = "dashboard.html";
    return;
  }

  // 🔹 If user opened this page directly (not from SuperAdmin → Hospitals)
  // then clear any leftover selectedHospitalId
  if (window.performance && performance.navigation.type === 1) {
    // page reloaded
    localStorage.removeItem("selectedHospitalId");
  }

  // Show filter only for SuperAdmin
  if (role === "3") {
    $("#hospitalFilterRow").show();

    $.ajax({
      url: "http://localhost:8080/hospital/list-all-Hospitals",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (res) {
        if (res.status && res.data) {
          const $select = $("#filterHospital");
          res.data.forEach(h => {
            $select.append(`<option value="${h.id}">${h.name}</option>`);
          });

          // Preselect if user came from Hospitals page
          if (selectedHospitalFromHospitals) {
            $select.val(selectedHospitalFromHospitals);
          }

          // Load patients after hospital dropdown is populated
          loadPatients();
        } else {
          loadPatients(); // still call it once
        }
      },
      error: function () {
        console.error("Failed to fetch hospitals");
        loadPatients(); // fallback
      }
    });
  } else {
    loadPatients();
  }

  // ---------- LOAD PATIENTS ----------
  function loadPatients() {
    let apiUrl = "";
    let dataParams = {};

    if (role === "3") {
      apiUrl = "http://localhost:8080/api/list-Patients-for-SuperAdmin";

      const selectedHospital = $("#filterHospital").val() || selectedHospitalFromHospitals;

      // Only include hospital_id if user selected one
      if (selectedHospital && selectedHospital !== "") {
        dataParams.hospital_id = selectedHospital;
      }

    } else if (role === "0" || role === "1") {
      apiUrl = "http://localhost:8080/api/list-Patients-Hospital-Wise";
      dataParams.hospital_id = hospital_id;
    } else {
      apiUrl = "http://localhost:8080/api/list-Patients";
    }

    $.ajax({
      url: apiUrl,
      method: "GET",
      data: dataParams,
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
                <td>${p.problem || ""}</td>
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
      error: function () {
        alert("Failed to load patients.");
      }
    });
  }

  // Reload patients when hospital filter changes (only for SuperAdmin)
  $("#filterHospital").on("change", function () {
    localStorage.setItem("selectedHospitalId", $(this).val());
    loadPatients();
  });

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
        error: function () {
          alert("Failed to delete patient.");
        }
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
        $("#editProblem").val(p.problem || "");
        $("#editEmail").val(p.email);
        $("#editModal").css("display", "flex");
      },
      error: function () {
        alert("Failed to fetch patient details.");
      }
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
      error: function () {
        alert("Failed to update patient.");
      }
    });
  });

  // ---------- CANCEL EDIT ----------
  $("#cancelEditBtn").click(function () {
    $("#editModal").hide();
  });

  // ---------- ADD PATIENT ----------
  $("#addPatientBtn").click(function () {
    window.location.href = "addPatient.html";
  });

  // ---------- BACK BUTTON ----------
  $("#backBtn").click(function () {
    window.location.href = "dashboard.html";
  });
});
