<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use App\Models\AppointmentModel;
use App\Models\VisitRecordsModel;
use PHPUnit\TextUI\XmlConfiguration\Validator;
helper('time_helper');
helper('time_helper2');
helper('validateFutureAppointment_helper');


class AppointmentController extends ResourceController
{
   
   private $appointmentModel, $userModel , $db , $visitRecords;

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
     $this->visitRecords = new VisitRecordsModel();
   }



public function ListAppointment()
{
    try {
        $userRole = $this->request->role;
        $userId = $this->request->id;
        
        $userRole = $this->request->role;
        $userId = $this->request->id;


        $hospital_id = $this->request->hospital_id; 
        print_r($hospital_id);
        print_r($userRole);
        print("Hi");
            die;
        

        if(!$hospital_id && $userRole != 2)
        {
            //for SuperAdmin
            $hospital_id = $this->request->getVar("hospital_id");
        }
        // print_r($userId);
        // die;
        
        //filters
        $appointmentId = $this->request->getVar("appointmentId");
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

            //hospital based filtering 
            if($userRole != "2")
            {
                $builder->where("appointments.hospital_id" , $hospital_id);
            }

            
            //user-based filtering
            if ($userRole == 2) { // Patient
            $builder->groupStart()
                        ->where("appointments.patient_id", $userId)
                        ->orWhere("appointments.parent_id IN (SELECT id FROM appointments WHERE patient_id={$userId})")//fetching child
                    ->groupEnd();
        } elseif ($userRole == 1) { // Doctor
            $builder->groupStart()
                        ->where("appointments.doctor_id" , $userId)
                        ->orWhere("appointments.parent_id IN (SELECT id FROM appointments WHERE doctor_id = {$userId})")
                    ->groupEnd();
        }

        // search based on apppointmentID
        if(!empty($appointmentId))
        {
            $builder->groupStart()
                ->where("appointments.id", $appointmentId)
                ->orWhere("appointments.parent_id", $appointmentId)
            ->groupEnd();
        }


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
        $perPage = 30;
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

public function ListAppointmentforPatients()
{
    try {
        $userRole = $this->request->role;
        $userId = $this->request->id;
        
        $userRole = $this->request->role;
        $userId = $this->request->id;


       
       
        
        //filters
        $appointmentId = $this->request->getVar("appointmentId");
        $doctorName = $this->request->getVar("doctorName");
        $patientName = $this->request->getVar("patientName");
        $doctorId    = $this->request->getVar("doctorId");
        $patientId   = $this->request->getVar("patientId");
        $status      = $this->request->getVar("status");
        $date        = $this->request->getVar("date"); // YYYY-MM-DD
        $dateFilter  = $this->request->getVar("dateFilter");
        $hospital_id = $this->request->getVar("hospital_id"); // today, this_week, last_month

 
        // base builder with joins
        $builder = $this->appointmentModel
            ->select("appointments.*,
                      doctor.name as DoctorName,
                      patient.name as PatientName,
                      hospital.name as HospitalName")
            ->join("users as doctor", "doctor.id = appointments.doctor_id", "left")
            ->join("users as patient", "patient.id = appointments.patient_id", "left")
            ->join("hospitals as hospital" , "hospital.id=appointments.hospital_id");

            

            
            //user-based filtering
            if ($userRole == 2) { // Patient
            $builder->groupStart()
                        ->where("appointments.patient_id", $userId)
                        ->orWhere("appointments.parent_id IN (SELECT id FROM appointments WHERE patient_id={$userId})")//fetching child
                    ->groupEnd();
        } elseif ($userRole == 1) { // Doctor
            $builder->groupStart()
                        ->where("appointments.doctor_id" , $userId)
                        ->orWhere("appointments.parent_id IN (SELECT id FROM appointments WHERE doctor_id = {$userId})")
                    ->groupEnd();
        }

        // search based on apppointmentID
        if(!empty($appointmentId))
        {
            $builder->groupStart()
                ->where("appointments.id", $appointmentId)
                ->orWhere("appointments.parent_id", $appointmentId)
            ->groupEnd();
        }


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

        if(!empty($hospital_id))
        {
            $builder->where("appointments.hospital_id" ,$hospital_id);
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
        $perPage = 30;
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
        $patientName = $user['name'];
        $patientNumber = $user['phone_no'] ?? null;
    
        
        $patientId = $user['id'];
        

            if($role != "2")
            {
            return $this->respond([
                "status" => false,
                "mssge" => "Only Patients can book the appointment",
            ]);
            }
            
            $doctorId = $this->request->getVar("doctorId");
            $hospital_id = $this->request->getVar("hospital_id");
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
            "hospital_id" => $hospital_id
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
                    "doctorName" => $doctorName,
                    "patient_id" => $patientId,
                    "patientName" => $patientName,
                    "patientNumber" => $patientNumber,
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
      
     //$patientId = $user['id'];

     $appointment_id = (int) $this->request->getVar("appointment_id");

    // print_r($patientId);
    // echo " ";
    // print_r($appointment_id);
    // die;

    $appointmentDetails = $this->appointmentModel->where("id" , $appointment_id)->first();

    if($appointmentDetails['status'] == 'rescheduled')
    {
        return $this->respond([
            "status" => false,
            "Mssge" => "Cannot reschedule as the appointmemt is already rescheduled , so check the updated appointment"
        ]);
    }

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
    $patientId = $appointmentDetails["patient_id"];
    $hospital_id = $appointmentDetails["hospital_id"];

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
        "parent_id" => $parent_id,
        "hospital_id" => $hospital_id
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


public function ExportAppointmentsCSV() //----- shld check once again
{
    try {
        $userRole = $this->request->userData->user->role;
        $userId = $this->request->userData->user->id;

        $appointmentId = $this->request->getVar("appointmentId");
        $search        = $this->request->getVar("search");
        $doctorName    = $this->request->getVar("doctorName");
        $patientName   = $this->request->getVar("patientName");
        $doctorId      = $this->request->getVar("doctorId");
        $patientId     = $this->request->getVar("patientId");
        $status        = $this->request->getVar("status");
        $date          = $this->request->getVar("date");
        $dateFilter    = $this->request->getVar("dateFilter");

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

        // role-based filtering
        if ($userRole == 2) { // Patient
            $builder->groupStart()
                        ->where("appointments.patient_id", $userId)
                        ->orWhere("appointments.parent_id IN (SELECT id FROM appointments WHERE patient_id={$userId})")
                    ->groupEnd();
        } elseif ($userRole == 1) { // Doctor
            $builder->groupStart()
                        ->where("appointments.doctor_id", $userId)
                        ->orWhere("appointments.parent_id IN (SELECT id FROM appointments WHERE doctor_id={$userId})")
                    ->groupEnd();
        }

        // appointment ID filter
        if (!empty($appointmentId)) {
            $builder->groupStart()
                    ->where("appointments.id", $appointmentId)
                    ->orWhere("appointments.parent_id", $appointmentId)
                    ->groupEnd();
        }

        // search by doctor/patient
        if (!empty($search)) {
            $builder->groupStart()
                    ->like("doctor.name", $search)
                    ->orLike("patient.name", $search)
                    ->groupEnd();
        }

        // other filters
        if (!empty($doctorName)) $builder->where("doctor.name", $doctorName);
        if (!empty($doctorId))   $builder->where("appointments.doctor_id", $doctorId);
        if (!empty($patientName)) $builder->where("patient.name", $patientName);
        if (!empty($patientId))   $builder->where("appointments.patient_id", $patientId);
        if (!empty($status))      $builder->where("appointments.status", $status);
        if (!empty($date))        $builder->where("appointments.Appointment_date", $date);

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

        $appointments = $builder->orderBy('appointments.id', 'DESC')->findAll();

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



public function completeAppointment()
{
    try{
         $userData = $this->request->userData;

         $userDetails = $this->userModel->find($userData->user->id);
         $userRole = $userDetails['role'];

         if($userRole !== '1')
         {
            return $this->respond([
                "status" => false,
                "Error_Mssge" => "Oly doctors can complete the appointment"
            ]);
         }


        $validationRules = [
            "appointment_id" => [
                "rules" => "required",
            ],
            "reason" => [
                "rules" => "required",
            ],
            "weight" => [
                "rules" => "required",
            ],
            "bp_systolic" => [
                "rules" => "required",
            ],
            "bp_diastolic" => [
                "rules" => "required",
            ],
            "doctor_comment" => [
                "rules" => "required",
            ],
        ];

        
        if(!$this->validate($validationRules))
            {
                return $this->respond([
                    "status" => false,
                    "Mssge" => "All fields are required",
                    "Error" => $this->validator->getErrors(),
                ]);
            }

     

       $appointmentId = $this->request->getVar("appointment_id");

       $reason = $this->request->getVar("reason");
       $weight = $this->request->getVar("weight");
       $bp_systolic = $this->request->getVar("bp_systolic");
       $bp_diastolic = $this->request->getVar("bp_diastolic");
       $doctor_comment = $this->request->getVar("doctor_comment");
    

       $appointmentDetails = $this->appointmentModel->find($appointmentId);
          
       



        if(!$appointmentDetails || !isset($appointmentDetails['status']) || $appointmentDetails['status'] != "booked") {
            return $this->respond([
                "status" => false,
                "Mssge" => "Appointment doesn't exist or maybe it has already been completed/rescheduled",
            ]);
        }


       $patient_id = $appointmentDetails['patient_id'];
       $doctor_id = $appointmentDetails['doctor_id'];
       $hospital_id = $appointmentDetails['hospital_id'];


       $data = [
        "appointment_id" => $appointmentId,
        "patient_id" => $patient_id,
        "doctor_id" => $doctor_id,
        "reason" => $reason,
        "weight" => $weight,
        "bp_systolic" => $bp_systolic,
        "bp_diastolic" => $bp_diastolic,
        "doctor_comment" => $doctor_comment,
        "hospital_id" => $hospital_id
       ];

       //Starting the transaction
       $this->db->transStart();
       $this->appointmentModel
        ->where('id', $appointmentId)
        ->set('status', 'completed')
        ->update();

        
        
       $this->visitRecords->insert($data);
       $this->db->transComplete();
       //Ending the transaction

       if ($this->db->transStatus() === false) {
            return $this->respond([
                "status" => false,
                "Mssge"  => "Transaction failed"
            ]);
        }

       return $this->respond([
            "status" => true,
            "Mssge" => "Successfully changed the status of appointment to completed and added the details into visit_records",
        ]);
       
    }
    catch(\Exception $e)
    {
       return $this->respond([
        "status" => false,
        "Error" => $e->getMessage()
       ]);
    }
}



public function showHistory()
{
    try{
       $userData = $this->request->userData;

       $patientId = $this->request->getVar('patientId');
       if (!$patientId) 
       {
           $userDetails = $this->userModel->find($userData->user->id);
           $patientId = $userDetails["id"];
       }

       $userDetails = $this->userModel->find($userData->user->id);
       $patientName = $userDetails['name'];

       //hospital-filter
       $hospital_id = $this->request->getVar("hospital_id");


       //For Patient
       $builder = $this->db->table('appointments a')
            ->select('
                a.id as appointment_id, 
                a.doctor_id,
                a.patient_id,
                h.id as HospitalID,
                h.name as HospitalName,
                h.contact_no as Hospital_contactNo,
                h.address as Hospital_address,
                u.name as doctorName,
                p.name as patientName,
                a.status,
                a.Appointment_date,
                a.Appointment_startTime,
                a.Appointment_endTime,
                v.reason,
                v.weight,
                v.bp_systolic,
                v.bp_diastolic,
                v.created_at,
                v.doctor_comment
            ')
            ->join('visit_records v', 'v.appointment_id = a.id')
            ->join('users u', 'u.id = a.doctor_id')
            ->join('users as p', 'p.id = a.patient_id')
            ->join('hospitals as h', 'h.id = a.hospital_id')
            ->where([
                "a.patient_id" => $patientId,
                "a.status" => "completed"
            ]);

        // 🏥 Add hospital-wise filter dynamically (if given)
        if (!empty($hospital_id)) {
            $builder->where("a.hospital_id", $hospital_id);
        }

        // 🗓️ Sort by date
        $query = $builder
            ->orderBy('a.Appointment_date', 'DESC')
            ->get()
            ->getResultArray();

        // 🧾 Format result
        $result = array_map(function ($row) {
            return [
                'appointment_id'        => $row['appointment_id'],
                'HospitalName'          => $row['HospitalName'],
                'HospitalID'            => $row['HospitalID'],
                'doctor_id'             => $row['doctor_id'],
                'doctorName'            => $row['doctorName'],
                'patientName'           => $row['patientName'],
                'patient_id'            => $row['patient_id'],
                'status'                => $row['status'],
                'appointment_date'      => $row['Appointment_date'],
                'appointment_startTime' => $row['Appointment_startTime'],
                'appointment_endTime'   => $row['Appointment_endTime'],
                'Hospital_contactNo'    => $row['Hospital_contactNo'],
                'Hospital_address'      => $row['Hospital_address'],
                'visit_records' => [
                    'date'           => $row['created_at'],
                    'reason'         => $row['reason'],
                    'weight'         => $row['weight'],
                    'bp_systolic'    => $row['bp_systolic'],
                    'bp_diastolic'   => $row['bp_diastolic'],
                    'doctor_comment' => $row['doctor_comment'],
                ]
            ];
        }, $query);

        // ✅ Final response
        return $this->respond([
            "status" => true,
            "Mssge" => "Fetched successfully",
            "data" => $result,
        ]);

    } catch (\Exception $e) {
        return $this->respond([
            "status" => false,
            "Error" => $e->getMessage()
        ]);
    }
}

public function getPatientStats()
{
    try {
       $userData = $this->request->userData;
        
        // Get patientId from query parameter, or use logged-in user's ID
        $patientId = $this->request->getVar('patientId');
        if (!$patientId) 
        {
            $patientId = $userData->user->id;
        }

        // Fetch weight & BP history for this patient
        $stats = $this->db->table('visit_records v')
                          ->select('v.created_at as date, v.weight, v.bp_systolic, v.bp_diastolic')
                          ->where('v.patient_id', $patientId)
                          ->where('v.isDeleted', 0)
                          ->orderBy('v.created_at', 'ASC')
                          ->get()
                          ->getResultArray();

        return $this->respond([
            "status" => true,
            "Mssge" => "Fetched patient stats successfully",
            "data" => $stats
        ]);
    } catch (\Exception $e) {
        return $this->respond([
            "status" => false,
            "Error" => $e->getMessage()
        ]);
    }
}


public function cancelAppointment()
{
    try{
      $userData = $this->request->userData;

      $appointmentId = $this->request->getVar("appointmentId");

      $appointmentDetails = $this->appointmentModel->where("id" , $appointmentId)->first();
    //   print_r($appointmentDetails);
    //   die;

      if($appointmentDetails['status'] != 'booked')
      {
        return $this->respond([
            "status" => false,
            "Mssge" => "Cannot cancel an appointment which is not booked , May be the appointment is rescheduled"
        ]);
      }
      

      $result = $this->appointmentModel->where("id" , $appointmentId)
                                       ->set('status' , 'cancelled')
                                       ->update();

      if($result)
      {
        return $this->respond([
            "status" => true,
            "Mssge" => "Successfully cancelled the appointment"
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

}

