$(document).ready(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userHospitalId = localStorage.getItem("hospital_id");
  const selectedHospitalId = localStorage.getItem("selectedHospitalId"); // ← selected hospital from hospital page

  if (!token) { window.location.href = "index.html"; return; }
  if (role === "1" || role === "2") { alert("Access Denied!"); window.location.href="dashboard.html"; return; }

  // Determine which hospital to load
  let hospitalFilter = role === "3" ? (selectedHospitalId || "") : userHospitalId;

  // Show hospital filter for SuperAdmin
  if (role === "3") {
    $("#hospitalFilterRow, #hospitalHeader").show();
    $.ajax({
      url: "http://localhost:8080/hospital/list-all-Hospitals",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function(res) {
        if(res.status && res.data) {
          res.data.forEach(h => {
            $("#filterHospital").append(`<option value="${h.id}" ${h.id == hospitalFilter ? 'selected' : ''}>${h.name}</option>`);
          });
        }
      },
      error: ()=>console.error("Failed to fetch hospitals")
    });
  }

  function loadDoctors() {
    const apiUrl = role === "3" 
      ? "http://localhost:8080/api/list-Doctors-for-SuperAdmin"
      : "http://localhost:8080/api/list-Doctors-Hospital-Wise";

    let dataParams = {};
    if(role !== "3") dataParams.hospital_id = hospitalFilter;
    else if(hospitalFilter) dataParams.hospital_id = hospitalFilter;

    $.ajax({
      url: apiUrl,
      method: "GET",
      data: dataParams,
      headers: { Authorization: `Bearer ${token}` },
      success: function(res) {
        const tbody = $("#doctorsTable tbody");
        tbody.empty();
        const doctors = res.data || [];
        if(doctors.length > 0){
          doctors.forEach(doc => {
            const hospitalName = doc.HospitalName || (role==="3" ? (doc.hospitalName || "—") : "");
            tbody.append(`<tr>
              <td>${doc.name}</td>
              <td>${doc.gender}</td>
              <td>${doc.expertise || ""}</td>
              <td>${doc.email}</td>
              ${role==="3"?`<td>${hospitalName}</td>`:""}
              <td>
                <button class="btn-edit" data-id="${doc.id}">Edit</button>
                <button class="btn-delete" data-id="${doc.id}">Delete</button>
              </td>
            </tr>`);
          });
        } else {
          tbody.append(`<tr><td colspan="${role==="3"?6:5}" style="text-align:center;">No doctors found</td></tr>`);
        }
      },
      error: function(){ alert("Failed to load doctors."); }
    });
  }

  loadDoctors();

  // Filter dropdown change
  $("#filterHospital").on("change", function(){
    hospitalFilter = $(this).val();
    loadDoctors();
  });

  // Delete doctor
  $(document).on("click",".btn-delete",function(){
    const doctorId=$(this).data("id");
    if(confirm("Are you sure you want to delete this doctor?")){
      $.ajax({
        url:`http://localhost:8080/api/Delete-Doctor`,
        method:"POST",
        headers:{Authorization:`Bearer ${token}`},
        data:{doctorId,_method:"DELETE"},
        success:function(){ alert("Doctor deleted."); loadDoctors(); },
        error:function(){ alert("Failed to delete doctor."); }
      });
    }
  });

  // Edit doctor
  $(document).on("click",".btn-edit",function(){
    const doctorId=$(this).data("id");
    $.ajax({
      url:`http://localhost:8080/api/user/${doctorId}`,
      method:"GET",
      headers:{Authorization:`Bearer ${token}`},
      success:function(res){
        const doc=res.data;
        $("#editDoctorId").val(doc.id);
        $("#editName").val(doc.name);
        $("#editGender").val(doc.gender);
        $("#editExpertise").val(doc.expertise||"");
        $("#editEmail").val(doc.email);
        $("#editModal").css("display","flex");
      },
      error:function(){ alert("Failed to fetch doctor details."); }
    });
  });

  $("#saveEditBtn").click(function(){
    const data={
      doctorId: $("#editDoctorId").val(),
      name: $("#editName").val(),
      gender: $("#editGender").val(),
      expertise: $("#editExpertise").val(),
      email: $("#editEmail").val()
    };
    $.ajax({
      url:"http://localhost:8080/api/Edit-Doctor",
      method:"POST",
      headers:{Authorization:`Bearer ${token}`},
      data:data,
      success:function(){ alert("Updated successfully."); $("#editModal").hide(); loadDoctors(); },
      error:function(){ alert("Failed to update doctor."); }
    });
  });

  $("#cancelEditBtn").click(()=>$("#editModal").hide());
  $("#backBtn").click(()=>window.location.href="dashboard.html");
  $("#addDoctorBtn").click(()=>window.location.href="addDoctor.html");

  // Remove selectedHospitalId after using it once
  if(selectedHospitalId) localStorage.removeItem("selectedHospitalId");
});
