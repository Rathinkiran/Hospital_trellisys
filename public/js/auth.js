$(document).ready(function() {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token && isValidToken(token)) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Tab switching functionality
    $('.tab-link').click(function() {
        const tabId = $(this).data('tab');
        $('.tab-link').removeClass('active');
        $('.tab-content').removeClass('active');
        $(this).addClass('active');
        $('#' + tabId).addClass('active');
    });

    // Handle login form submission
    $('#loginForm').submit(function(e) {
        e.preventDefault();

        const formData = {
            email: $('#loginEmail').val().trim(),
            password: $('#loginPassword').val()
        };

        if (!formData.email || !formData.password) {
            $('#loginMessage').html('<div class="message error">Please fill in all fields</div>');
            return;
        }

        $('#loginMessage').html('<div class="message">Logging in...</div>');

        $.ajax({
            url: 'http://localhost:8080/login', // your backend endpoint
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            dataType: 'json'
        })
        .done(function(response) {
            console.log('Login Response:', response);
            if (response.status && response.token) {
                localStorage.setItem('authToken', response.token);

                const userData = parseJwt(response.token);
                localStorage.setItem('userData', JSON.stringify(userData));

                window.location.href = 'dashboard.html';
            } else {
                $('#loginMessage').html('<div class="message error">' + (response.mssge || 'Login failed') + '</div>');
            }
        })
        .fail(function(xhr, status, error) {
            console.error('AJAX Error:', status, error);
            let errorMsg = 'Login failed. Please try again.';
            if (xhr.responseJSON && xhr.responseJSON.mssge) {
                errorMsg = xhr.responseJSON.mssge;
            }
            $('#loginMessage').html('<div class="message error">' + errorMsg + '</div>');
        });
    });

    // Handle registration form submission
    $('#registerForm').submit(function(e) {
        e.preventDefault();
        
        const formData = {
            name: $('#regName').val().trim(),
            gender: $('#regGender').val(),
            problem: $('#regProblem').val().trim(),
            email: $('#regEmail').val().trim(),
            password: $('#regPassword').val()
        };

        // Basic validation
        if (!formData.name || !formData.gender || !formData.problem || !formData.email || !formData.password) {
            $('#registerMessage').html('<div class="message error">Please fill in all fields</div>');
            return;
        }

        $('#registerMessage').html('<div class="message">Registering...</div>');

        // Since your backend doesn't have a register endpoint in LoginController yet,
        // we'll need to add one. For now, I'll use a placeholder URL
        $.ajax({
            url: 'http://localhost:8080/register', // You'll need to implement this endpoint
            type: 'POST',
            data: formData,
            success: function(response) {
                if (response.status) {
                    $('#registerMessage').html('<div class="message success">Registration successful. Please login.</div>');
                    // Clear form
                    $('#registerForm')[0].reset();
                    // Switch to login tab after a delay
                    setTimeout(() => {
                        $('.tab-link').removeClass('active');
                        $('.tab-content').removeClass('active');
                        $('.tab-link[data-tab="login"]').addClass('active');
                        $('#login').addClass('active');
                    }, 2000);
                } else {
                    $('#registerMessage').html('<div class="message error">' + (response.mssge || 'Registration failed') + '</div>');
                }
            },
            error: function(xhr, status, error) {
                let errorMsg = 'Registration failed. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.mssge) {
                    errorMsg = xhr.responseJSON.mssge;
                }
                $('#registerMessage').html('<div class="message error">' + errorMsg + '</div>');
            }
        });
    });

    // Function to parse JWT token
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    // Function to check if token is valid (not expired)
    function isValidToken(token) {
        try {
            const payload = parseJwt(token);
            if (!payload || !payload.exp) return false;
            
            // Check if token is expired
            return Date.now() < payload.exp * 1000;
        } catch (e) {
            return false;
        }
    }
});