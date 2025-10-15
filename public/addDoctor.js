$(document).ready(function(){
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // 0 = Admin, 3 = SuperAdmin (based on your setup)
    if(!token){
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }

    const hospitalSection = $("#hospitalSection");
    const hospitalSelect = $("#hospitalSelect");

    // ✅ If SuperAdmin → Show hospital selector & load hospitals
    if(role === "3" || role === "superadmin") {
        hospitalSection.show();
        loadHospitals();
    }

    // 🔹 Fetch Hospitals List
    function loadHospitals() {
        $.ajax({
            url: "http://localhost:8080/hospital/list-all-Hospitals",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            success: function(res) {
                if(res.status && res.data.length > 0) {
                    hospitalSelect.empty().append(`<option value="">Select Hospital</option>`);
                    res.data.forEach(h => {
                        hospitalSelect.append(`<option value="${h.id}">${h.name}</option>`);
                    });
                } else {
                    hospitalSelect.html(`<option value="">No hospitals available</option>`);
                }
            },
            error: function(err) {
                console.error("Error fetching hospitals:", err);
                hospitalSelect.html(`<option value="">Failed to load hospitals</option>`);
            }
        });
    }

    // 🔹 Back button
    $("#backBtn").click(function(){
        window.location.href = "dashboard.html";
    });

    // 🔹 Submit form
    $("#addDoctorForm").on("submit", function(e){
        e.preventDefault();
        $("#formError").text("");

        const name = $("#name").val().trim();
        const email = $("#email").val().trim();
        const password = $("#password").val();
        const gender = $("#gender").val();
        const expertise = $("#expertise").val().trim();

        // Hospital logic based on role
        let hospital_id = "";
        if(role === "3" || role === "superadmin") {
            hospital_id = hospitalSelect.val();
            if(!hospital_id) {
                $("#formError").text("Please select a hospital.");
                return;
            }
        }

        // Validation
        if(!name || !email || !password || !gender || !expertise){
            $("#formError").text("All fields are required.");
            return;
        }

        // Build payload
        const payload = { name, email, password, gender, expertise };
        if(hospital_id) payload.hospital_id = hospital_id;

        // 🔹 AJAX Call
        $.ajax({
            url: "http://localhost:8080/api/add-Doctors",
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            data: payload,
            success: function(res){
                if(res.status){
                    alert(res.mssge || "Doctor added successfully!");
                    window.location.href = "doctor.html";
                } else {
                    $("#formError").text(res.mssge || "Failed to add doctor.");
                }
            },
            error: function(xhr){
                const msg = xhr.responseJSON?.mssge || "Server error.";
                $("#formError").text(msg);
            }
        });
    });
});
