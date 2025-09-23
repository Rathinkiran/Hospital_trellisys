$(document).ready(function() {
    const token = localStorage.getItem("token"); // Auth token

    $("#addDoctorForm").on("submit", function(e) {
        e.preventDefault();

        const data = {
            name: $("#name").val(),
            email: $("#email").val(),
            password: $("#password").val(),
            gender: $("#gender").val(),
            expertise: $("#expertise").val()
        };

        // Clear previous alerts
        $("#alertBox").hide();

        $.ajax({
            url: "http://localhost:8080/api/add-Doctors",
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: data,
            success: function(res) {
                if(res.status) {
                    $("#alertBox").removeClass("error").addClass("success").text(res.mssge).show();
                    $("#addDoctorForm")[0].reset();
                } else {
                    $("#alertBox").removeClass("success").addClass("error").text(res.mssge || "Failed to add doctor").show();
                }
            },
            error: function(xhr) {
                const errMsg = xhr.responseJSON?.mssge || "Error adding doctor";
                $("#alertBox").removeClass("success").addClass("error").text(errMsg).show();
            }
        });
    });
});
