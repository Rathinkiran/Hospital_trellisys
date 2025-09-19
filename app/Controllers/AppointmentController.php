<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use App\Models\AppointmentModel;
use PHPUnit\TextUI\XmlConfiguration\Validator;
helper('time_helper');
helper('time_helper2');
helper('validateFutureAppointment_helper');


class AppointmentController extends ResourceController
{
   
   private $appointmentModel, $userModel , $db;

  //  private function convertToDatabaseTime($time12Hour)
  // {   
  //    $dateTime = DateTime::createFromFormat('h:i A', $time12Hour);
      
  //    return $dateTime->format('H:i:s');
  // }

   public function __construct()
   {
     $this->db = db_connect();
     $this->appointmentModel = new AppointmentModel();
     $this->userModel = new UserModel();
   }


public function ListAppointment()
{
    try {
        //filters
        $doctorName = $this->request->getVar("doctorName");
        $patientName = $this->request->getVar("patientName");
        $doctorId    = $this->request->getVar("doctorId");
        $patientId   = $this->request->getVar("patientId");
        $status      = $this->request->getVar("status");
        $date        = $this->request->getVar("date"); // YYYY-MM-DD
        $dateFilter  = $this->request->getVar("dateFilter"); // today, this_week, last_month

        // base builder with joins
        $builder = $this->appointmentModel
            ->select("appointments.*,
                      doctor.name as DoctorName,
                      patient.name as PatientName")
            ->join("users as doctor", "doctor.id = appointments.doctor_id", "left")
            ->join("users as patient", "patient.id = appointments.patient_id", "left");

        // doctor filters
        if (!empty($doctorName)) {
            $builder->where("doctor.name", $doctorName);
        }
        if (!empty($doctorId)) {
            $builder->where("appointments.doctor_id", $doctorId);
        }

        // patient filters
        if (!empty($patientName)) {
            $builder->where("patient.name", $patientName);
        }
        if (!empty($patientId)) {
            $builder->where("appointments.patient_id", $patientId);
        }

        // status filter
        if (!empty($status)) {
            $builder->where("appointments.status", $status);
        }

        // exact date filter
        if (!empty($date)) {
            $builder->where("appointments.Appointment_date", $date);
        }

        // date range filters
        if (!empty($dateFilter)) {
            $today = date('Y-m-d');

            if ($dateFilter === 'today') {
                $builder->where("appointments.Appointment_date", $today);
            }

            if ($dateFilter === 'this_week') {
                $monday = date('Y-m-d', strtotime('monday this week'));
                $sunday = date('Y-m-d', strtotime('sunday this week'));
                $builder->where("appointments.Appointment_date >=", $monday);
                $builder->where("appointments.Appointment_date <=", $sunday);
            }

            if ($dateFilter === 'last_month') {
                $firstDayLastMonth = date('Y-m-01', strtotime('first day of last month'));
                $lastDayLastMonth  = date('Y-m-t', strtotime('last month'));
                $builder->where("appointments.Appointment_date >=", $firstDayLastMonth);
                $builder->where("appointments.Appointment_date <=", $lastDayLastMonth);
            }
        }

        //sorting
        $sortBy    = $this->request->getVar("sortBy") ?? "appointments.id";
        $sortOrder = $this->request->getVar("sortOrder") ?? "ASC";

        //pagination
        $perPage = 10;
        $page    = $this->request->getVar("page") ?? 1;

        $data  = $builder->orderBy($sortBy, $sortOrder)->paginate($perPage, 'default', $page);
        $pager = $builder->pager;

        $currentPage = $pager->getCurrentPage();
        $totalPages  = $pager->getPageCount();

        $baseUrl = base_url('appointment/List-appointments');

        $paginationInfo = [
            'total_pages'   => $totalPages,
            'previous_page' => ($currentPage > 1)
                ? $baseUrl . '?page=' . ($currentPage - 1)
                : null,
            'next_page'     => ($currentPage < $totalPages)
                ? $baseUrl . '?page=' . ($currentPage + 1)
                : null,
        ];

        return $this->respond([
            "status" => true,
            "Msgge"  => "Successfully fetched all the Appointments list",
            "data"   => $data,
            "pager"  => $paginationInfo
        ]);
    } catch (\Exception $e) {
        return $this->respond([
            "status" => false,
            "Error"  => $e->getMessage(),
        ]);
    }
}





  public function BookAppointment()
   {
    try{
      $validationRules = [
        "doctorId" => [
          "rules" => "required"
        ],
        "appointment_date" => [
          "rules" => "required|valid_date[Y-m-d]",  // YYYY-MM-DD
        ],
        "appointment_startTime" => [
          "rules" => "required|valid_date[h:i A]",  // HH:MM AM/PM format
        ],
      ];
      

      if(!$this->validate($validationRules))
      {
        return $this->respond([
          "status" => false,
          "error" => $this->validator->getErrors(),
        ]);
      }

      
       $userData = $this->request->userData;

      $user = $this->userModel->find($userData->user->id);

      $role = $user['role'];
      
      $patientId = $user['id'];
    

        if($role != "2")
        {
          return $this->respond([
              "status" => false,
              "mssge" => "Only Patients can book the appointment",
          ]);
        }
        
         $doctorId = $this->request->getVar("doctorId");
         $doctorDetails = $this->userModel->where("id" , $doctorId)->get()->getRow();
         $doctorName = $doctorDetails->name;
         $doctorRole = $doctorDetails->role;


         if($doctorRole != "1")
         {
           return $this->respond([
              "status" => false,
              "mssge" => "Appointment can be booked with oly Doctor",
          ]);
         }


         $appointment_date = $this->request->getVar("appointment_date"); // YYYY-MM-DD format
         $startTime = $this->request->getVar("appointment_startTime"); // HH:MM AM/PM

       
         $appointment_startTime = convertToDatabaseTime($startTime); // HH:MM:SS format
         $appointment_endTime = addHoursToTime($appointment_startTime); // HH:MM:SS format


         //checking whether the appointment date/time is in the future
         $validationResult = validateFutureAppointment($appointment_date, $appointment_startTime);

        if (!$validationResult['status']) {
            return $this->respond([
                "status" => false,
                "Error"  => $validationResult['message']  
            ]);
        }
        

         $conflictingAppointment = $this->appointmentModel->where("doctor_id" , $doctorId)
                                                              ->where("Appointment_date" , $appointment_date)
                                                              ->groupStart()
                                                                  ->groupStart()
                                                                      ->where("Appointment_startTime <=" , $appointment_startTime)
                                                                      ->where("Appointment_endTime >" , $appointment_endTime)
                                                                  ->groupEnd()
                                                                  ->orGroupStart()
                                                                      ->where("Appointment_startTime <" , $appointment_endTime)
                                                                      ->where("Appointment_endTime >=" , $appointment_endTime)
                                                                  ->groupEnd()
                                                                  ->orGroupStart()
                                                                      ->where("Appointment_startTime >=", $appointment_startTime)
                                                                      ->where("Appointment_endTime <=", $appointment_endTime)
                                                                  ->groupEnd()
                                                              ->groupEnd()
                                                              ->first();


if ($conflictingAppointment) {
    return $this->respond([
        "status" => false,
        "error" => "Doctor already has a conflicting appointment at this time slot."
    ]);
}                                                              


//          if($alreadyExistingAppointment)
//          {
//            foreach($alreadyExistingAppointment as $appointment)
//            {
//               $existingStart = $appointment['Appointment_startTime'];
//               $existingEnd = $appointment['Appointment_endTime'];

//         // 1. New start time is between existing start and end time
//         // 2. New end time is between existing start and end time  
//         // 3. New appointment completely surrounds existing appointment
         
//         if (
//             ($appointment_startTime >= $existingStart && $appointment_startTime < $existingEnd) ||
//             ($appointment_endTime > $existingStart && $appointment_endTime <= $existingEnd) ||
//             ($appointment_startTime <= $existingStart && $appointment_endTime >= $existingEnd)
//         ) {
//             $hasConflict = true;
//             break; // No need to check further if we found one conflict
//         }
//     }
//   if ($hasConflict) {
//         return $this->respond([
//             "status" => false,
//             "error" => "Doctor already has a conflicting appointment at this time slot. Please choose a different time."
//         ]);
//     }
// }
           
         
      
         $data = [
          "doctor_id" => $doctorId,
          "patient_id" => $patientId,
          "Appointment_date" => $appointment_date,
          "Appointment_startTime" => $appointment_startTime,
          "Appointment_endTime" => $appointment_endTime,
         ];


         $result = $this->appointmentModel->insert($data);


      if($result)
      {
      // $formattedDateTime = date("Y-m-d g:i A", strtotime($appointment_date . " " . $appointment_startTime));

          return $this->respond([
              "status" => true,
              "mssge"  => "Booked appointment successfully with " . $doctorName,
              "appointment" => [
                  "doctor_id" => $doctorId,
                  "patient_id" => $patientId,
                  "date"   => $appointment_date,   
                  "time" => $startTime
              ],
              "Result" => $result
          ]);
         }

         
       
    }catch(\Exception $e)
    {
        return $this->respond([
            "status" => false,
            "Error" => $e->getMessage(),
        ]);
    }
    
   }

public function rescheduleAppointment()
{
  try{
      $validationRules = [
        "appointment_id" => [
          "rules" => "required"
        ],
        "newAppointmentstartTime" => [
          "rules" => "required"
        ],
        "reschedule_reason" => [
          "rules" => "required"
        ]
      ];


    if(!$this->validate($validationRules))
    {
       return $this->respond([
        "status" => false,
        "Mssge" => "All the required fields are required",
        "Error" => $this->validator->getErrors(),
       ]);
    }


     $userData = $this->request->userData;

     $user = $this->userModel->find($userData->user->id);

     $role = $user['role'];
      
     $patientId = $user['id'];

    $appointment_id = (int) $this->request->getVar("appointment_id");

    // print_r($patientId);
    // echo " ";
    // print_r($appointment_id);
    // die;

    $appointmentDetails = $this->appointmentModel->where("id" , $appointment_id)->first();

    // print_r($appointmentDetails);
    // die;
  //Retrieve all the necessary details
    $newAppointmentDate = $this->request->getVar("newAppointmentDate") ?? $appointmentDetails['Appointment_date'];
    $newAppointmentstartTime = $this->request->getVar("newAppointmentstartTime") ?? $appointmentDetails['Appointment_startTime'];// HH:MM AM/PM
    $reschedule_reason = $this->request->getVar("reschedule_reason");


    



    //calculating newAppointmentEndTime
    $appointment_startTime = convertToDatabaseTime($newAppointmentstartTime); // HH:MM:SS format
    $appointment_endTime = addHoursToTime($appointment_startTime);       
    $doctor_id = $appointmentDetails["doctor_id"];

    $validationResult = validateFutureAppointment($newAppointmentDate, $appointment_startTime);

        if (!$validationResult['status']) {
            return $this->respond([
                "status" => false,
                "Error"  => $validationResult['message']  
            ]);
        }
        


    $conflictingAppointment = $this->appointmentModel->where("doctor_id" , $doctor_id)
                                                          ->where("Appointment_date" , $newAppointmentDate)
                                                             ->groupStart()
                                                                  ->groupStart()
                                                                      ->where("Appointment_startTime <=" , $appointment_startTime)
                                                                      ->where("Appointment_endTime >" , $appointment_endTime)
                                                                  ->groupEnd()
                                                                  ->orGroupStart()
                                                                      ->where("Appointment_startTime <" , $appointment_endTime)
                                                                      ->where("Appointment_endTime >=" , $appointment_endTime)
                                                                  ->groupEnd()
                                                                  ->orGroupStart()
                                                                      ->where("Appointment_startTime >=", $appointment_startTime)
                                                                      ->where("Appointment_endTime <=", $appointment_endTime)
                                                                  ->groupEnd()
                                                              ->groupEnd()
                                                              ->first();


      if($conflictingAppointment)
      {
        return $this->respond([
          "status" => false,
          "mssge" => "Cannot be rescheduled , As there is a conflicting appointment for the doctor  with the new DATE/TIME"
        ]);
      }

      $parent_id = $appointmentDetails["parent_id"] ?? $appointment_id;
      // print_r($parent_id);
      // print_r($appointmentDetails);
      // die;

      $data = [
        "status" => "booked",
        "doctor_id" => $doctor_id,
        "patient_id" => $patientId,
        "Appointment_date" => $newAppointmentDate,
        "Appointment_startTime" => $appointment_startTime,
        "Appointment_endTime" => $appointment_endTime,
        "parent_id" => $parent_id
      ];

      $this->db->transStart();
      // var_dump($appointment_id);
      // $record = $this->appointmentModel->find($appointment_id);
      // var_dump($record);
      // die;

     $updateSuccess = $this->appointmentModel->update(
        $appointment_id,
        [
            'status'            => 'rescheduled',
            'reschedule_reason' => $reschedule_reason
        ]
      );


          if(!$updateSuccess) 
          {
            throw new \Exception("Failed to update original appointment");
          }

          $newAppointmentid = $this->appointmentModel->insert($data);
            
            
  

        if(!$newAppointmentid)
        {
        throw new \Exception("Failed to create new appointment");
        }

        

      $this->db->transComplete();

      if ($this->db->transStatus() === FALSE) {
            throw new \Exception("Transaction failed");
        }


      return $this->respond([
        "status" => true,
        "Mssge" => "Rescheduled Successfully",
      ]);

  }catch(\Exception $e)
  {
     $this->db->transRollback();
    return $this->respond([
      "status" => false,
      "Error" => $e->getMessage(),
    ]);
  }
  
}



public function ExportAppointmentsCSV()
{
    try {
        // Filters
        $doctorName = $this->request->getVar("doctorName");
        $patientName = $this->request->getVar("patientName");
        $doctorId    = $this->request->getVar("doctorId");
        $patientId   = $this->request->getVar("patientId");
        $status      = $this->request->getVar("status");
        $date        = $this->request->getVar("date"); 
        $dateFilter  = $this->request->getVar("dateFilter");

        // Sorting
        $allowedSortColumns = [
            'appointments.id', 'appointments.status', 'appointments.Appointment_date',
            'appointments.Appointment_startTime', 'appointments.Appointment_endTime',
            'doctor.name', 'patient.name', 'appointments.created_at', 'appointments.updated_at'
        ];
        $sortBy    = $this->request->getVar("sortBy") ?? "appointments.id";
        $sortOrder = strtoupper($this->request->getVar("sortOrder") ?? "DESC");
        $sortOrder = in_array($sortOrder, ['ASC', 'DESC']) ? $sortOrder : 'DESC';
        $sortBy    = in_array($sortBy, $allowedSortColumns) ? $sortBy : 'appointments.id';

        // Base builder with joins
        $builder = $this->appointmentModel
            ->select("appointments.id,
                      appointments.status,
                      appointments.rescheduled_from,
                      appointments.reschedule_reason,
                      appointments.Appointment_date,
                      appointments.Appointment_startTime,
                      appointments.Appointment_endTime,
                      doctor.name as DoctorName,
                      patient.name as PatientName,
                      appointments.created_at,
                      appointments.updated_at")
            ->join("users as doctor", "doctor.id = appointments.doctor_id", "left")
            ->join("users as patient", "patient.id = appointments.patient_id", "left");

        // Apply filters
        if (!empty($doctorName)) {
            $builder->where("doctor.name", $doctorName);
        }
        if (!empty($doctorId)) {
            $builder->where("appointments.doctor_id", $doctorId);
        }
        if (!empty($patientName)) {
            $builder->where("patient.name", $patientName);
        }
        if (!empty($patientId)) {
            $builder->where("appointments.patient_id", $patientId);
        }
        if (!empty($status)) {
            $builder->where("appointments.status", $status);
        }
        if (!empty($date)) {
            $builder->where("appointments.Appointment_date", $date);
        }
        if (!empty($dateFilter)) {
            $today = date('Y-m-d');
            if ($dateFilter === 'today') {
                $builder->where("appointments.Appointment_date", $today);
            }
            if ($dateFilter === 'this_week') {
                $monday = date('Y-m-d', strtotime('monday this week'));
                $sunday = date('Y-m-d', strtotime('sunday this week'));
                $builder->where("appointments.Appointment_date >=", $monday);
                $builder->where("appointments.Appointment_date <=", $sunday);
            }
            if ($dateFilter === 'last_month') {
                $firstDayLastMonth = date('Y-m-01', strtotime('first day of last month'));
                $lastDayLastMonth  = date('Y-m-t', strtotime('last month'));
                $builder->where("appointments.Appointment_date >=", $firstDayLastMonth);
                $builder->where("appointments.Appointment_date <=", $lastDayLastMonth);
            }
        }

        // Fetch all appointments with sorting
        $appointments = $builder->orderBy($sortBy, $sortOrder)->findAll();

        // Set headers for CSV
        $filename = "appointments_export_" . date('Y-m-d_H-i-s') . ".csv";
        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=\"$filename\"");

        $output = fopen("php://output", "w");

        // CSV header
        fputcsv($output, [
            "ID", "Status", "Rescheduled From", "Reschedule Reason",
            "Appointment Date", "Start Time", "End Time",
            "Doctor Name", "Patient Name",
            "Created At", "Updated At"
        ]);

        // Write data
        foreach ($appointments as $row) {
    fputcsv($output, [
        $row['id'],
        $row['status'],
        $row['rescheduled_from'],
        $row['reschedule_reason'],
        $row['Appointment_date'],
        !empty($row['Appointment_startTime']) ? date("g:i A", strtotime($row['Appointment_startTime'])) : '',
        !empty($row['Appointment_endTime'])   ? date("g:i A", strtotime($row['Appointment_endTime']))   : '',
        $row['DoctorName'],
        $row['PatientName'],
        $row['created_at'],
        $row['updated_at']
    ]);
}

        fclose($output);
        exit; 

    } catch (\Exception $e) {
        return $this->respond([
            "status" => false,
            "Error" => $e->getMessage(),
        ]);
    }
}


   

}
