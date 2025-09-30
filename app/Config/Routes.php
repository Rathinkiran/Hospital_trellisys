<?php

use CodeIgniter\Router\RouteCollection;
use App\Controllers\AdminController;
use App\Controllers\AppointmentController;

/**
 * @var RouteCollection $routes
 */


$routes->get('/', 'Home::index');

$routes->post("login"  , "LoginController::login");
$routes->post("register"  , "LoginController::register");
$routes->get('api/user/(:num)', 'AdminController::getUser/$1');
$routes->post('api/update-profile', 'AdminController::updateProfile');
$routes->get('api/dashboard/stats' , [AdminController::class , 'stats']);

$routes->group("api" , ["namespace" => "App\Controllers", "filter" => "Auth" ] , function($routes){
    // Routes for Admin
    $routes->group('', ['filter' => 'roleAdmin'], function ($routes) {
        $routes->post('add-Doctors', [AdminController::class, 'addDoctor']);
        $routes->delete('Delete-Doctor', [AdminController::class, 'deleteDoctors']);
        $routes->post('Edit-Doctor', [AdminController::class, 'editDoctors']);
    });

    // Routes for doctor + admin , tat sol
    $routes->group('', ['filter' => 'role_Doctor_and_Admin'], function ($routes) {
        $routes->post('add-Patients', [AdminController::class, 'addPatient']);
        $routes->post('cancel-Appointment' , [AppointmentController::class , 'cancelAppointment']);
        
        $routes->delete('Delete-Patient', [AdminController::class, 'deletePatient']);
    });

    // Routes for all authenticated users
    $routes->post('Edit-Patient', [AdminController::class, 'editPatient']);
    $routes->get('list-Doctors', [AdminController::class, 'listDoctors']);
    $routes->get('list-Patients', [AdminController::class, 'listPatients']);
});


$routes->group("appointment" , ["namespace" => "App\Controllers" , "filter" => "Auth"] , function($routes)
{
    $routes->group('' , ["filter" => "rolePatient"] , function($routes)
    {
       $routes->post('Book-appointment', [AppointmentController::class, 'bookAppointment']);
    });

    $routes->group('', ['filter' => 'role_Doctor_and_Admin'], function ($routes) 
    {
      $routes->post('complete-Appointment' , [AppointmentController::class , 'completeAppointment']);    
    });

    
    $routes->get('List-appointments', [AppointmentController::class, 'listAppointment']);
    $routes->get('show-History' , [AppointmentController::class , 'showHistory']);
    $routes->get('getDetailsforPatient' , [AdminController::class , 'getDetailsforPatient']);
    $routes->get('getPatientStats' , [AppointmentController::class , 'getPatientStats']);
    
    $routes->post('appointment/check-availability', [AppointmentController::class, 'checkAvailability']);
    $routes->post('Reschedule-appointment', [AppointmentController::class, 'rescheduleAppointment']);
    $routes->get('export-csv', [AppointmentController::class, 'ExportAppointmentsCSV']);
});


