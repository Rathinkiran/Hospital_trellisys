<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use App\Models\AppointmentModel;
use PHPUnit\TextUI\XmlConfiguration\Validator;
helper('time_helper');
helper('time_helper2');

class AppointmentController extends ResourceController
{
   
   private $appointmentModel, $userModel;

  //  private function convertToDatabaseTime($time12Hour)
  // {   
  //    $dateTime = DateTime::createFromFormat('h:i A', $time12Hour);
      
  //    return $dateTime->format('H:i:s');
  // }

   public function __construct()
   {
     $this->appointmentModel = new AppointmentModel();
     $this->userModel = new UserModel();
   }

   public function ListAppointment()
   {
      try{
          $data = $this->appointmentModel->findAll();

          return $this->respond([
            "status" => true,
            "Msgge" => "Successfully fetched all the Appointments list",
            "data" => $data
          ]);
      }catch(\Exception $e)
      {
        return $this->respond([
          "status" => false,
          "Error" => $e->getMessage(),
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
              "mssge" => "Oly Patient can book the appointment",
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

         return $this->respond([
          "status" => true,
          "mssge" => "Booked appointment date successfully with " . $doctorName . "",
          "Result" => $result,
         ]);
       
    }catch(\Exception $e)
    {
        return $this->respond([
            "status" => false,
            "Error" => $e->getMessage(),
        ]);
    }
    
   }

   public function checkAvailability()
{
    try {
        $validationRules = [
            "doctorId" => [
                "rules" => "required"
            ],
            "appointment_date" => [
                "rules" => "required|valid_date[Y-m-d]",
            ],
            "appointment_startTime" => [
                "rules" => "required",
            ],
        ];

        if (!$this->validate($validationRules)) {
            return $this->respond([
                "status" => false,
                "error" => $this->validator->getErrors(),
            ]);
        }

        $doctorId = $this->request->getVar("doctorId");
        $appointment_date = $this->request->getVar("appointment_date");
        $startTime = $this->request->getVar("appointment_startTime");

        $appointment_startTime = convertToDatabaseTime($startTime);
        $appointment_endTime = addHoursToTime($appointment_startTime);

        // Check for conflicts
        $conflictingAppointment = $this->appointmentModel
            ->where("doctor_id", $doctorId)
            ->where("Appointment_date", $appointment_date)
            ->where("(Appointment_startTime <= '" . $appointment_startTime . "' AND Appointment_endTime > '" . $appointment_startTime . "') OR 
                     (Appointment_startTime < '" . $appointment_endTime . "' AND Appointment_endTime >= '" . $appointment_endTime . "') OR
                     (Appointment_startTime >= '" . $appointment_startTime . "' AND Appointment_endTime <= '" . $appointment_endTime . "')")
            ->first();

        if ($conflictingAppointment) {
            return $this->respond([
                "status" => false,
                "available" => false,
                "message" => "Time slot not available",
                "conflicting_appointment" => $conflictingAppointment
            ]);
        }

        return $this->respond([
            "status" => true,
            "available" => true,
            "message" => "Time slot is available"
        ]);

    } catch(\Exception $e) {
        return $this->respond([
            "status" => false,
            "Error" => $e->getMessage(),
        ]);
    }
}
   

}
