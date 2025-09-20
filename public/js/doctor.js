$(document).ready(function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html"; // redirect if not logged in
        return;
    }

    // ---------- FETCH AND RENDER DOCTORS ----------
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
                        const row = `
                            <tr>
                                <td>${doc.name}</td>
                                <td>${doc.gender}</td>
                                <td>${doc.expertise}</td>
                                <td>${doc.email}</td>
                                <td>
                                    <button class="btn-edit" data-id="${doc.id}">Edit</button>
                                    <button class="btn-delete" data-id="${doc.id}">Delete</button>
                                </td>
                            </tr>
                        `;
                        tbody.append(row);
                    });
                } else {
                    tbody.append(`<tr><td colspan="5" style="text-align:center;">No doctors found</td></tr>`);
                }
            },
            error: function () {
                alert("Failed to load doctors.");
            }
        });
    }

    // ---------- ADD DOCTOR ----------
    $("#addDoctorBtn").on("click", function () {
        window.location.href = "addDoctor.html"; // create a separate page for adding a doctor
    });

    // ---------- EDIT DOCTOR ----------
    $(document).on("click", ".btn-edit", function () {
        const doctorId = $(this).data("id");
        window.location.href = `editDoctor.html?id=${doctorId}`; // redirect with query param
    });

    // ---------- DELETE DOCTOR ----------
    $(document).on("click", ".btn-delete", function () {
        const doctorId = $(this).data("id");
        if (confirm("Are you sure you want to delete this doctor?")) {
            $.ajax({
                url: `http://localhost:8080/api/delete-doctor/${doctorId}`,
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
                success: function () {
                    alert("Doctor deleted successfully.");
                    loadDoctors(); // refresh table
                },
                error: function () {
                    alert("Failed to delete doctor.");
                }
            });
        }
    });

    // ---------- INITIAL LOAD ----------
    loadDoctors();
});
