$(document).ready(function () {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Unauthorized! Please login again.");
    window.location.href = "index.html";
    return;
  }

  const hospitalFilter = $("#hospitalFilter");
  const adminsTableBody = $("#adminsTableBody");

  // ✅ Fetch Hospitals for Filter
  function fetchHospitals() {
    $.ajax({
      url: "http://localhost:8080/hospital/list-all-Hospitals",
      type: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (response) {
        if (response.status && response.data.length > 0) {
          hospitalFilter.empty().append(`<option value="">All Hospitals</option>`);
          response.data.forEach((h) => {
            hospitalFilter.append(`<option value="${h.id}">${h.name}</option>`);
          });
        }
      },
      error: function (xhr) {
        console.error("Error fetching hospitals:", xhr.responseText);
      },
    });
  }

  // ✅ Fetch Admins List
  function fetchAdmins(hospitalId = "") {
    adminsTableBody.html(`<tr><td colspan="4" class="no-data">Loading...</td></tr>`);

    $.ajax({
      url: "http://localhost:8080/api/list-Admins",
      type: "GET",
      headers: { Authorization: `Bearer ${token}` },
      data: hospitalId ? { hospital_id: hospitalId } : {},
      success: function (response) {
        if (response.status && response.data.length > 0) {
          adminsTableBody.empty();
          response.data.forEach((admin) => {
            adminsTableBody.append(`
              <tr>
                <td>${admin.HospitalName || "-"}</td>
                <td>${admin.name || "-"}</td>
                <td>${admin.email || "-"}</td>
                <td>${admin.phone_no || "-"}</td>
              </tr>
            `);
          });
        } else {
          adminsTableBody.html(`<tr><td colspan="4" class="no-data">No admins found.</td></tr>`);
        }
      },
      error: function (xhr) {
        console.error("Error fetching admins:", xhr.responseText);
        adminsTableBody.html(`<tr><td colspan="4" class="no-data">Failed to load data.</td></tr>`);
      },
    });
  }

  // ✅ Event Listener for Hospital Filter
  hospitalFilter.change(function () {
    const selectedHospital = $(this).val();
    fetchAdmins(selectedHospital);
  });
  $(document).ready(function () {
  $("#backBtn").on("click", function () {
    window.location.href = "dashboard.html";
  });
});


  // ✅ Initial Load
  fetchHospitals();
  fetchAdmins();
});
