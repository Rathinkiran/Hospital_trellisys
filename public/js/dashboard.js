$(document).ready(function() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Get role from userData
    let userRole = userData.user?.role || userData.role;
    let userName = userData.user?.name || userData.name || userData.user?.email || 'User';
    let userEmail = userData.user?.email || userData.email;
    let userId = userData.user?.id || userData.id;

    // Set user welcome message
    $('#userWelcome').text('Welcome, ' + userName);
    $('#profileIcon').text(userName.charAt(0).toUpperCase());

    // Set up role-based UI
    setupRoleBasedUI(userRole, userData);
    loadAllDoctorsForDropdown();
    loadDashboardStats();

    // Navigation menu click handler
    $('.sidebar-menu li').click(function() {
        if ($(this).hasClass('active')) return;
        
        $('.sidebar-menu li').removeClass('active');
        $(this).addClass('active');
        
        const section = $(this).data('section');
        showSection(section);
        
        // Load data for the section
        if (section === 'doctors') {
            loadDoctors();
        } else if (section === 'patients') {
            loadPatients();
        } else if (section === 'appointments') {
            loadAppointments();
        } else if (section === 'bookAppointment') {
            loadDoctorsForAppointment();
        }
    });

    // Profile dropdown toggle
    $('#profileIcon').click(function() {
        $('#profileDropdown').toggleClass('show');
    });

    // Close dropdown when clicking outside
    $(document).click(function(e) {
        if (!$(e.target).closest('.profile-menu').length) {
            $('#profileDropdown').removeClass('show');
        }
    });

    // Edit profile
    $('#editProfileLink').click(function(e) {
        e.preventDefault();
        $('#profileDropdown').removeClass('show');
        loadUserProfile();
        $('#editProfileModal').addClass('show');
    });

    // Logout
    $('#logoutLink').click(function(e) {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    });

    // Close modals
    $('.modal-close').click(function() {
        $(this).closest('.modal').removeClass('show');
    });

    // Add Doctor button
    $('#addDoctorBtn').click(function() {
        showSection('addDoctor');
    });

    // Cancel Add Doctor
    $('#cancelAddDoctor').click(function() {
        showSection('doctors');
    });

    // Add Doctor form submission
    $('#addDoctorForm').submit(function(e) {
        e.preventDefault();
        addDoctor();
    });

    // Add Patient button
    $('#addPatientBtn').click(function() {
        showSection('addPatient');
    });

    // Cancel Add Patient
    $('#cancelAddPatient').click(function() {
        showSection('patients');
    });

    // Add Patient form submission
    $('#addPatientForm').submit(function(e) {
        e.preventDefault();
        addPatient();
    });

     loadAllDoctorsForDropdown();

    // Book Appointment button
    $('#bookAppointmentBtn').click(function() {
        showSection('bookAppointment');
        loadDoctorsForAppointment();
    });

    // Cancel Book Appointment
    $('#cancelBookAppointment').click(function() {
        showSection('appointments');
    });

    // Book Appointment form submission
    $('#bookAppointmentForm').submit(function(e) {
        e.preventDefault();
        bookAppointment();
    });

    // Department change handler for appointment booking
    $('#appointmentDepartment').change(function() {
        loadDoctorsForAppointment();
    });

    // Edit Profile form submission
    $('#editProfileForm').submit(function(e) {
        e.preventDefault();
        updateProfile();
    });

    // Edit Doctor form submission
    $('#editDoctorForm').submit(function(e) {
        e.preventDefault();
        updateDoctor();
    });

    // Edit Patient form submission
    $('#editPatientForm').submit(function(e) {
        e.preventDefault();
        updatePatient();
    });

    // Close modals when clicking outside
    $('.modal').click(function(e) {
        if ($(e.target).hasClass('modal')) {
            $(this).removeClass('show');
        }
    });

    // Load initial data
    loadDoctors();
    loadPatients();
    loadAppointments();
});

function setupRoleBasedUI(role, userData) {
    // Show/hide menu items based on role
    if (role === '0') { // Admin
        $('#addDoctorMenu, #addPatientMenu').removeClass('hidden');
        $('#bookAppointmentMenu').addClass('hidden');
    } else if (role === '1') { // Doctor
        $('#addPatientMenu').removeClass('hidden');
        $('#addDoctorMenu, #bookAppointmentMenu').addClass('hidden');
    } else { // Patient
        $('#bookAppointmentMenu').removeClass('hidden');
        $('#addDoctorMenu, #addPatientMenu').addClass('hidden');
    }
    
    // Update role info on dashboard
    const roleText = role === '0' ? 'Administrator' : (role === '1' ? 'Doctor' : 'Patient');
    $('#userRoleInfo').html('<p>You are logged in as: <strong>' + roleText + '</strong></p>');
    
    // Show/hide edit profile fields based on role
    if (role === '1') { // Doctor
        $('#editExpertiseGroup').show();
        $('#editProblemGroup').hide();
    } else if (role === '2') { // Patient
        $('#editExpertiseGroup').hide();
        $('#editProblemGroup').show();
    } else { // Admin
        $('#editExpertiseGroup').hide();
        $('#editProblemGroup').hide();
    }
}

function showSection(section) {
    $('.section').addClass('hidden');
    $('#' + section + 'Section').removeClass('hidden');
}

function loadDoctors() {
    const token = localStorage.getItem('authToken');
    
    $.ajax({
        url: 'http://localhost:8080/api/list-Doctors',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.status && response.data) {
                populateDoctorsTable(response.data);
            } else {
                console.error('Failed to load doctors:', response.mssge);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading doctors:', error);
            alert('Error loading doctors: ' + error);
        }
    });
}

function populateDoctorsTable(doctors) {
    const tbody = $('#doctorsTable tbody');
    tbody.empty();
    
    doctors.forEach(doctor => {
        const row = `
            <tr>
                <td>${doctor.name}</td>
                <td>${doctor.gender}</td>
                <td>${doctor.expertise || 'N/A'}</td>
                <td>${doctor.email}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${doctor.id}" data-name="${doctor.name}" data-gender="${doctor.gender}" data-expertise="${doctor.expertise}" data-email="${doctor.email}">Edit</button>
                    <button class="btn-action btn-delete" data-id="${doctor.id}" data-name="${doctor.name}">Delete</button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
    
    // Add event listeners to edit buttons
    $('.btn-edit').click(function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        const gender = $(this).data('gender');
        const expertise = $(this).data('expertise');
        const email = $(this).data('email'); // Get email from data attribute
        
        $('#editDoctorId').val(id);
        $('#editDoctorName').val(name);
        $('#editDoctorGender').val(gender);
        $('#editDoctorExpertise').val(expertise);
        $('#editDoctorEmail').val(email); // Set email field value
        
        $('#editDoctorModal').addClass('show');
    });
    
    // Add event listeners to delete buttons
    $('.btn-delete').click(function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        if (confirm('Are you sure you want to delete doctor: ' + name + '?')) {
            deleteDoctor(id);
        }
    });
}

function addDoctor() {
    const token = localStorage.getItem('authToken');
    const formData = {
        name: $('#doctorName').val(),
        gender: $('#doctorGender').val(),
        expertise: $('#doctorExpertise').val(),
        email: $('#doctorEmail').val(),
        password: $('#doctorPassword').val()
    };
    
    // Basic validation
    if (!formData.name || !formData.gender || !formData.expertise || !formData.email || !formData.password) {
        $('#addDoctorMessage').html('<div class="message error">Please fill in all fields</div>');
        return;
    }
    
    $.ajax({
        url: 'http://localhost:8080/api/add-Doctors',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: formData,
        success: function(response) {
            if (response.status) {
                $('#addDoctorMessage').html('<div class="message success">Doctor added successfully</div>');
                $('#addDoctorForm')[0].reset();
                loadDoctors();
                setTimeout(() => {
                    showSection('doctors');
                }, 1500);
            } else {
                $('#addDoctorMessage').html('<div class="message error">' + (response.mssge || 'Failed to add doctor') + '</div>');
            }
        },
        error: function(xhr, status, error) {
            $('#addDoctorMessage').html('<div class="message error">Error adding doctor: ' + error + '</div>');
        }
    });
}

function updateDoctor() {
    const token = localStorage.getItem('authToken');
    const formData = {
        doctorId: $('#editDoctorId').val(),
        name: $('#editDoctorName').val(),
        gender: $('#editDoctorGender').val(),
        expertise: $('#editDoctorExpertise').val(),
        email: $('#editDoctorEmail').val() // Make sure this is included
    };
    
    console.log('Updating doctor with data:', formData);
    
    // Add password only if provided
    const password = $('#editDoctorPassword').val();
    if (password) {
        formData.password = password;
        console.log('Password will be updated');
    }
    
    $.ajax({
        url: 'http://localhost:8080/api/Edit-Doctor',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: formData,
        success: function(response) {
            console.log('Doctor update response:', response);
            if (response.status) {
                $('#editDoctorMessage').html('<div class="message success">Doctor updated successfully</div>');
                loadDoctors();
                setTimeout(() => {
                    $('#editDoctorModal').removeClass('show');
                    $('#editDoctorPassword').val(''); // Clear password field
                }, 1500);
            } else {
                let errorMsg = response.mssge || 'Failed to update doctor';
                if (response.error) {
                    errorMsg += ' - ' + JSON.stringify(response.error);
                }
                $('#editDoctorMessage').html('<div class="message error">' + errorMsg + '</div>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Doctor update error:', error, xhr);
            let errorMsg = 'Error updating doctor: ' + error;
            if (xhr.responseJSON && xhr.responseJSON.mssge) {
                errorMsg = xhr.responseJSON.mssge;
            } else if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMsg += ' - ' + JSON.stringify(xhr.responseJSON.error);
            }
            $('#editDoctorMessage').html('<div class="message error">' + errorMsg + '</div>');
        }
    });
}

 function deleteDoctor(doctorId) {
    const token = localStorage.getItem('authToken');
    
    if (!confirm('Are you sure you want to delete this doctor?')) {
        return;
    }
    
    console.log('Deleting doctor with ID:', doctorId);
    
    // For DELETE requests with CodeIgniter, we need to use a different approach
    // CodeIgniter doesn't handle DELETE request data well, so we'll use POST with _method override
    $.ajax({
        url: 'http://localhost:8080/api/Delete-Doctor',
        type: 'POST', // Use POST instead of DELETE
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {
            doctorId: doctorId,
            _method: 'DELETE' // Add method override for CodeIgniter
        },
        success: function(response) {
            console.log('Doctor delete response:', response);
            if (response.status) {
                alert('Doctor deleted successfully');
                loadDoctors(); // Reload the doctors list
            } else {
                alert('Failed to delete doctor: ' + (response.mssge || 'Unknown error'));
            }
        },
        error: function(xhr, status, error) {
            console.error('Doctor delete error:', error, xhr);
            let errorMsg = 'Error deleting doctor: ' + error;
            if (xhr.responseJSON && xhr.responseJSON.mssge) {
                errorMsg = xhr.responseJSON.mssge;
            }
            alert(errorMsg);
        }
    });
}

function loadPatients() {
    const token = localStorage.getItem('authToken');
    
    $.ajax({
        url: 'http://localhost:8080/api/list-Patients',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.status && response.data) {
                populatePatientsTable(response.data);
            } else {
                console.error('Failed to load patients:', response.mssge);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading patients:', error);
            alert('Error loading patients: ' + error);
        }
    });
}

function populatePatientsTable(patients) {
    const tbody = $('#patientsTable tbody');
    tbody.empty();
    
    patients.forEach(patient => {
        const row = `
            <tr>
                <td>${patient.name}</td>
                <td>${patient.gender}</td>
                <td>${patient.problem || 'N/A'}</td>
                <td>${patient.email}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${patient.id}" data-name="${patient.name}" data-gender="${patient.gender}" data-problem="${patient.problem}">Edit</button>
                    <button class="btn-action btn-delete" data-id="${patient.id}" data-name="${patient.name}">Delete</button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
    
    // Add event listeners to edit buttons
    $('.btn-edit').click(function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        const gender = $(this).data('gender');
        const problem = $(this).data('problem');
        
        $('#editPatientId').val(id);
        $('#editPatientName').val(name);
        $('#editPatientGender').val(gender);
        $('#editPatientProblem').val(problem);
        
        $('#editPatientModal').addClass('show');
    });
    
    // Add event listeners to delete buttons
    $('.btn-delete').click(function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        if (confirm('Are you sure you want to delete patient: ' + name + '?')) {
            deletePatient(id);
        }
    });
}

function addPatient() {
    const token = localStorage.getItem('authToken');
    const formData = {
        name: $('#patientName').val(),
        gender: $('#patientGender').val(),
        problem: $('#patientProblem').val(),
        email: $('#patientEmail').val(),
        password: $('#patientPassword').val()
    };
    
    // Basic validation
    if (!formData.name || !formData.gender || !formData.problem || !formData.email || !formData.password) {
        $('#addPatientMessage').html('<div class="message error">Please fill in all fields</div>');
        return;
    }
    
    $.ajax({
        url: 'http://localhost:8080/api/add-Patients',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: formData,
        success: function(response) {
            if (response.status) {
                $('#addPatientMessage').html('<div class="message success">Patient added successfully</div>');
                $('#addPatientForm')[0].reset();
                loadPatients();
                setTimeout(() => {
                    showSection('patients');
                }, 1500);
            } else {
                $('#addPatientMessage').html('<div class="message error">' + (response.mssge || 'Failed to add patient') + '</div>');
            }
        },
        error: function(xhr, status, error) {
            $('#addPatientMessage').html('<div class="message error">Error adding patient: ' + error + '</div>');
        }
    });
}

function updatePatient() {
    const token = localStorage.getItem('authToken');
    const formData = {
        patientId: $('#editPatientId').val(),
        name: $('#editPatientName').val(),
        gender: $('#editPatientGender').val(),
        problem: $('#editPatientProblem').val(),
        email: $('#editPatientEmail').val()
    };
    
    // Add password only if provided
    const password = $('#editPatientPassword').val();
    if (password) {
        formData.password = password;
    }
    
    console.log('Updating patient with data:', formData);
    
    $.ajax({
        url: 'http://localhost:8080/api/Edit-Patient',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: formData,
        success: function(response) {
            console.log('Patient update response:', response);
            if (response.status) {
                $('#editPatientMessage').html('<div class="message success">Patient updated successfully</div>');
                loadPatients();
                setTimeout(() => {
                    $('#editPatientModal').removeClass('show');
                    $('#editPatientPassword').val(''); // Clear password field
                }, 1500);
            } else {
                $('#editPatientMessage').html('<div class="message error">' + (response.mssge || 'Failed to update patient') + '</div>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Patient update error:', error, xhr);
            let errorMsg = 'Error updating patient: ' + error;
            if (xhr.responseJSON && xhr.responseJSON.mssge) {
                errorMsg = xhr.responseJSON.mssge;
            }
            $('#editPatientMessage').html('<div class="message error">' + errorMsg + '</div>');
        }
    });
}



function deletePatient(patientId) {
    const token = localStorage.getItem('authToken');
    
    if (!confirm('Are you sure you want to delete this patient?')) {
        return;
    }
    
    console.log('Deleting patient with ID:', patientId);
    
    // Use POST with _method override for CodeIgniter
    $.ajax({
        url: 'http://localhost:8080/api/Delete-Patient',
        type: 'POST', // Use POST instead of DELETE
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {
            patientId: patientId,
            _method: 'DELETE' // Add method override for CodeIgniter
        },
        success: function(response) {
            console.log('Patient delete response:', response);
            if (response.status) {
                alert('Patient deleted successfully');
                loadPatients(); // Reload the patients list
            } else {
                alert('Failed to delete patient: ' + (response.mssge || 'Unknown error'));
            }
        },
        error: function(xhr, status, error) {
            console.error('Patient delete error:', error, xhr);
            let errorMsg = 'Error deleting patient: ' + error;
            if (xhr.responseJSON && xhr.responseJSON.mssge) {
                errorMsg = xhr.responseJSON.mssge;
            }
            alert(errorMsg);
        }
    });
}



function loadAppointments() {
    const token = localStorage.getItem('authToken');
    
    $.ajax({
        url: 'http://localhost:8080/appointment/List-appointments',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.status && response.data) {
                populateAppointmentsTable(response.data);
            } else {
                console.error('Failed to load appointments:', response.mssge);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading appointments:', error);
            alert('Error loading appointments: ' + error);
        }
    });
}

// Function to load dashboard statistics
function loadDashboardStats() {
    const token = localStorage.getItem('authToken');
    
    // Load doctors count
    $.ajax({
        url: 'http://localhost:8080/api/list-Doctors',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.status && response.data) {
                $('#doctorsCount').text(response.data.length);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading doctors count:', error);
        }
    });
    
    // Load patients count
    $.ajax({
        url: 'http://localhost:8080/api/list-Patients',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.status && response.data) {
                $('#patientsCount').text(response.data.length);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading patients count:', error);
        }
    });
    
    // Load appointments count
    $.ajax({
        url: 'http://localhost:8080/appointment/List-appointments',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.status && response.data) {
                $('#appointmentsCount').text(response.data.length);
                loadRecentActivity(response.data);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading appointments count:', error);
        }
    });
}

// Function to load recent activity
function loadRecentActivity(appointments) {
    const recentActivity = $('#recentActivity');
    recentActivity.empty();
    
    if (!appointments || appointments.length === 0) {
        recentActivity.html('<p>No recent activity</p>');
        return;
    }
    
    // Sort appointments by date (newest first) and take the latest 5
    const sortedAppointments = appointments.sort((a, b) => {
        return new Date(b.Appointment_date) - new Date(a.Appointment_date);
    }).slice(0, 5);
    
    let activityHtml = '<ul class="activity-list">';
    
    sortedAppointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.Appointment_date);
        const formattedDate = appointmentDate.toLocaleDateString();
        const formattedTime = formatTime(appointment.Appointment_startTime);
        
        activityHtml += `
            <li class="activity-item">
                <div class="activity-icon">📅</div>
                <div class="activity-details">
                    <div class="activity-type">Appointment with Dr. ${appointment.doctor_name || 'Unknown'}</div>
                    <div class="activity-time">${formattedDate} at ${formattedTime}</div>
                </div>
            </li>
        `;
    });
    
    activityHtml += '</ul>';
    recentActivity.html(activityHtml);
}

// Function to format time in 12-hour format
function formatTime(timeString) {
    if (!timeString) return 'N/A';
    
    // Check if time is already in 12-hour format
    if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
    }
    
    // Convert 24-hour format to 12-hour format
    const timeParts = timeString.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return hours + ':' + minutes + ' ' + ampm;
}

function populateAppointmentsTable(appointments) {
    const tbody = $('#appointmentsTable tbody');
    tbody.empty();
    
    appointments.forEach(appointment => {
        const row = `
            <tr>
                <td>${appointment.doctor_name || 'Doctor ' + appointment.doctor_id}</td>
                <td>${appointment.patient_name || 'Patient ' + appointment.patient_id}</td>
                <td>${formatDate(appointment.Appointment_date)}</td>
                <td>${formatTime(appointment.Appointment_startTime)}</td>
                <td>${formatTime(appointment.Appointment_endTime)}</td>
            </tr>
        `;
        tbody.append(row);
    });
}

function loadDoctorsForAppointment() {
    const token = localStorage.getItem('authToken');
    
    $.ajax({
        url: 'http://localhost:8080/api/list-Doctors',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            console.log('Doctors for appointment response:', response);
            if (response.status && response.data) {
                populateDoctorsDropdown(response.data);
            } else {
                console.error('Failed to load doctors for appointment:', response.mssge);
                $('#bookAppointmentMessage').html('<div class="message error">Failed to load doctors: ' + (response.mssge || 'Unknown error') + '</div>');
            }
        },
        
        error: function(xhr, status, error) {
            console.error('Error loading doctors for appointment:', error, xhr);
            $('#bookAppointmentMessage').html('<div class="message error">Error loading doctors: ' + error + '</div>');
        }
    });
}


function populateDoctorsDropdown(doctors) {
    const dropdown = $('#appointmentDoctor');
    dropdown.empty();
    dropdown.append('<option value="">Select Doctor</option>');

    const department = $('#appointmentDepartment').val();
    console.log('Selected department:', department);

    let doctorsFound = false;

    doctors.forEach(doctor => {
        console.log('Doctor:', doctor.name, 'Expertise:', doctor.expertise);

        // Match more flexibly (case-insensitive, substring)
        if (
            !department ||
            (doctor.expertise &&
             doctor.expertise.toLowerCase().includes(department.toLowerCase()))
        ) {
            dropdown.append(
                `<option value="${doctor.id}">${doctor.name} (${doctor.expertise || 'General'})</option>`
            );
            doctorsFound = true;
        }
    });

    if (!doctorsFound) {
        if (department) {
            dropdown.append(`<option value="" disabled>No doctors found in ${department} department</option>`);
        } else {
            dropdown.append('<option value="" disabled>No doctors available</option>');
        }
    }
}


// Add this function to load doctors when the page loads
function loadAllDoctorsForDropdown() {
    const token = localStorage.getItem('authToken');
    
    $.ajax({
        url: 'http://localhost:8080/api/list-Doctors',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.status && response.data) {
                // Store doctors globally for filtering
                window.allDoctors = response.data;
                console.log('Loaded doctors for dropdown:', window.allDoctors);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading doctors for dropdown:', error);
        }
    });
}

// Call this function when the dashboard loads
// Add this to your $(document).ready() function:
$(document).ready(function() {
    // ... existing code ...
    
    // Load doctors for dropdown
   
    
    // ... rest of your code ...
});

function bookAppointment() {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userRole = userData.user?.role || userData.role;
    const userId = userData.user?.id || userData.id;
    
    // Only patients can book appointments
    if (userRole !== '2') {
        $('#bookAppointmentMessage').html('<div class="message error">Only patients can book appointments.</div>');
        return;
    }
    
    const formData = {
        doctorId: $('#appointmentDoctor').val(),
        appointment_date: $('#appointmentDate').val(),
        appointment_startTime: $('#appointmentTime').val()
    };
    
    // Basic validation
    if (!formData.doctorId || !formData.appointment_date || !formData.appointment_startTime) {
        $('#bookAppointmentMessage').html('<div class="message error">Please fill in all fields</div>');
        return;
    }
    
    // Convert time to 12-hour format with AM/PM
    const timeParts = formData.appointment_startTime.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedTime = hours + ':' + minutes + ' ' + ampm;
    
    formData.appointment_startTime = formattedTime;
    
    $('#bookAppointmentMessage').html('<div class="message">Checking availability...</div>');
    
    $.ajax({
        url: 'http://localhost:8080/appointment/Book-appointment',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: formData,
        success: function(response) {
            console.log('Appointment booking response:', response);
            if (response.status) {
                $('#bookAppointmentMessage').html('<div class="message success">Appointment booked successfully</div>');
                $('#bookAppointmentForm')[0].reset();
                loadAppointments();
                setTimeout(() => {
                    showSection('appointments');
                }, 1500);
            } else {
                let errorMsg = response.mssge || 'Failed to book appointment';
                if (response.error) {
                    errorMsg = response.error;
                }
                $('#bookAppointmentMessage').html('<div class="message error">' + errorMsg + '</div>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Appointment booking error:', error, xhr);
            let errorMsg = 'Error booking appointment: ' + error;
            if (xhr.responseJSON && xhr.responseJSON.mssge) {
                errorMsg = xhr.responseJSON.mssge;
            } else if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMsg = xhr.responseJSON.error;
            }
            $('#bookAppointmentMessage').html('<div class="message error">' + errorMsg + '</div>');
        }
    });
}

function loadUserProfile() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.user?.id || userData.id;
    const token = localStorage.getItem('authToken');
    
    // Load user details from API
    $.ajax({
        url: 'http://localhost:8080/api/user/' + userId,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.status && response.data) {
                const user = response.data;
                $('#editName').val(user.name);
                $('#editEmail').val(user.email);
                $('#editGender').val(user.gender);
                $('#editExpertise').val(user.expertise || '');
                $('#editProblem').val(user.problem || '');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading user profile:', error);
            // Fallback to data from token
            $('#editName').val(userData.user?.name || userData.name || '');
            $('#editEmail').val(userData.user?.email || userData.email || '');
            $('#editGender').val(userData.user?.gender || userData.gender || 'male');
        }
    });
}

function updateProfile() {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.user?.id || userData.id;
    
    const formData = {
        name: $('#editName').val(),
        email: $('#editEmail').val(),
        gender: $('#editGender').val(),
        password: $('#editPassword').val() || undefined
    };
    
    // Add role-specific fields
    if (userData.user?.role === '1' || userData.role === '1') { // Doctor
        formData.expertise = $('#editExpertise').val();
    } else if (userData.user?.role === '2' || userData.role === '2') { // Patient
        formData.problem = $('#editProblem').val();
    }
    
    $.ajax({
        url: 'http://localhost:8080/api/update-profile',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: formData,
        success: function(response) {
            if (response.status) {
                $('#editProfileMessage').html('<div class="message success">Profile updated successfully</div>');
                // Update stored user data
                if (response.data) {
                    localStorage.setItem('userData', JSON.stringify(response.data));
                }
                setTimeout(() => {
                    $('#editProfileModal').removeClass('show');
                }, 1500);
            } else {
                $('#editProfileMessage').html('<div class="message error">' + (response.mssge || 'Failed to update profile') + '</div>');
            }
        },
        error: function(xhr, status, error) {
            $('#editProfileMessage').html('<div class="message error">Error updating profile: ' + error + '</div>');
        }
    });
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatTime(timeString) {
    if (!timeString) return 'N/A';
    // Convert 24h time to 12h format
    const timeParts = timeString.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return hours + ':' + minutes + ' ' + ampm;
}