$(document).ready(function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html"; // redirect if not logged in
        return;
    }

    // ---------- FETCH AND RENDER PATIENTS ----------
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
                    patients.forEach(patient => {
                        const row = `
                            <tr>
                                <td>${patient.name}</td>
                                <td>${patient.gender}</td>
                                <td>${patient.problem}</td>
                                <td>${patient.email}</td>
                                <td>
                                    <button class="btn-edit" data-id="${patient.id}">Edit</button>
                                    <button class="btn-delete" data-id="${patient.id}">Delete</button>
                                </td>
                            </tr>
                        `;
                        tbody.append(row);
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

    // ---------- ADD PATIENT ----------
    $("#addPatientBtn").on("click", function () {
        window.location.href = "addPatient.html"; // create a page for adding a patient
    });

    // ---------- EDIT PATIENT ----------
    $(document).on("click", ".btn-edit", function () {
        const patientId = $(this).data("id");
        window.location.href = `editPatient.html?id=${patientId}`; // redirect with query param
    });

    // ---------- DELETE PATIENT ----------
    $(document).on("click", ".btn-delete", function () {
        const patientId = $(this).data("id");
        if (confirm("Are you sure you want to delete this patient?")) {
            $.ajax({
                url: `http://localhost:8080/api/delete-patient/${patientId}`,
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
                success: function () {
                    alert("Patient deleted successfully.");
                    loadPatients(); // refresh table
                },
                error: function () {
                    alert("Failed to delete patient.");
                }
            });
        }
    });

    // ---------- INITIAL LOAD ----------
    loadPatients();
});
