<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use App\Models\AppointmentModel;
use App\Models\HospitalsModel;
use Exception;

class AdminController extends ResourceController
{
    private $userModel;
    private $appointmentModel;
    private $hospitalModel;
    private $db;

    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->appointmentModel = new AppointmentModel();
        $this->hospitalModel = new HospitalsModel();
        $this->db = db_connect();
    }


    public function addDoctor()
    { 
        $validationRules = [
        "name" => [
            "rules" => "required"
        ],
         "gender" => [
            "rules" => "required"
        ],
         "expertise" => [
            "rules" => "required"
        ],
        "email" => [
            "rules" => "required|min_length[3]|valid_email"
        ],
        "password" => [
            "rules" => "required|min_length[3]|"
        ]
     ];

     if(!$this->validate($validationRules))
     {
        return $this->respond([
            "status" => false,
            "mssge" => "Fields are required",
            "Error" => $this->validator->getErrors(),
        ]);
     }


       $hospital_id = $this->request->hospital_id;


       if(!$hospital_id)
       {
        return $this->respond([
            "status" => false,
            "Mssge" => "Admin doesn't have hospital_id"
        ]);
       }

       $name = $this->request->getVar("name");
       $email = $this->request->getVar("email");
       $password = $this->request->getVar("password");
       $gender = $this->request->getVar("gender");
       $role = "1";
       $expertise = $this->request->getVar("expertise");
    

       $data = [
        "name" => $name,
        "email" => $email,
        "password" => $password,
        "gender" => $gender,
        "role" => $role,
        "expertise" => $expertise,
        "hospital_id" => $hospital_id
       ];

    //    print_r($data);
    //    exit;

       $result = $this->userModel->insert($data);

       if(!$result)
       {
         return $this->respond([
            "status" => false,
            "mssge" => "Could not insert Doctors data",
        ]);
       }

       return $this->respond([
        "status" => true,
        "mssge" => "Successfully inserted data",
        "result" => $result
       ]);
    
    }


    public function addPatient()
    {        
        $validationRules = [
                "name" => [
                    "rules" => "required"
                ],
                "gender" => [
                    "rules" => "required"
                ],
                "problem" => [
                    "rules" => "required"
                ],
                "email" => [
                    "rules" => "required|min_length[3]|valid_email"
                ],
                "password" => [
                    "rules" => "required|min_length[3]|"
                ]
            ];

            if(!$this->validate($validationRules))
            {
                return $this->respond([
                    "status" => false,
                    "mssge" => "Fields are required",
                    "Error" => $this->validator->getErrors(),
                ]);
            }

            $name = $this->request->getVar("name");
            $email = $this->request->getVar("email");
            $password = $this->request->getVar("password");
            $gender = $this->request->getVar("gender");
            $role = "2";
            $problem = $this->request->getVar("problem");

            $data = [
                "name" => $name,
                "email" => $email,
                "password" => $password,
                "gender" => $gender,
                "role" => $role,
                "problem" => $problem
            ];

            //    print_r($data);
            //    exit;

            $result = $this->userModel->insert($data);

            if(!$result)
            {
                return $this->respond([
                    "status" => false,
                    "mssge" => "Could not insert Doctors data",
                ]);
            }

            return $this->respond([
                "status" => true,
                "mssge" => "Successfully inserted data",
                "result" => $result
            ]);
    }


    public function ListDoctors()
    {
        //Shld do some checks
        $userRole = $this->request->role;
        
        //for Admin - using hospital_id from his token
        $hospital_id = $this->request->hospital_id; 

        if(!$hospital_id)
        {
            //for SuperAdmin
            $hospital_id = $this->request->getVar("hospital_id");
        }

        // $data = $this->userModel->where("role" , "1")
        //                         ->where("hospital_id" , $hospital_id)
        //                         ->findAll(); // role : 0 => oly list Doctors
         $data = $this->userModel->select("users.*,
                                           hospital.name as HospitalName")
                                 ->where("role" , "1")
                                 ->where("hospital_id" , $hospital_id)
                                 ->join("hospitals as hospital" , "hospital.id=users.hospital_id" , "left")
                                 ->findAll();
        if($data)
        {
            return $this->respond([
            "status" => true,
            "mssge" => "Fetched all the doctors data successfully",
            "data" => $data,
            ]);
        }else{
             return $this->respond([
            "status" => false,
            "mssge" => "Could not fetch the data"
            ]);
        }
        
    }



    public function ListPatients()
    {
        try{
        //Shld do some checks
        $hospital_id = $this->request->hospital_id;


        if(!$hospital_id)
        {
            $hospital_id = $this->request->getVar("hospital_id");
        }
        

        $data = $this->appointmentModel->select("appointments.patient_id,
                                                 users.*")
                                       ->where("appointments.hospital_id" , $hospital_id)
                                       ->join("users as users" , "users.id=appointments.patient_id")
                                       ->findAll(); // role : 0 => oly list Doctors


        if($data)
        {
            return $this->respond([
            "status" => true,
            "mssge" => "Fetched all the Patients data successfully",
            "data" => $data,
            ]);
        }else{
             return $this->respond([
            "status" => false,
            "mssge" => "Could not fetch the data"
            ]);
        }
        }
        catch(\Exception $e)
        {
            return $this->respond(([
                "status" => false,
                "Error" => $e->getMessage()
            ]));
        }
        
        
    }


    public function editDoctors()
    {

       try{
        //    $userData = $this->request->userData;

        //     $user = $this->userModel->find($userData->user->id); 

        //     $userRole = $user['role'];


                $id = $this->request->getVar("doctorId"); 
                
                $Doctordata = $this->userModel->where("id" , $id)->first();

                $name = $this->request->getVar("name") ?? $Doctordata["name"];
                $role = $this->request->getVar("role") ?? $Doctordata["role"];
                $gender = $this->request->getVar("gender") ?? $Doctordata["gender"];
                $expertise = $this->request->getVar("expertise") ?? $Doctordata["expertise"];
                $email = $this->request->getVar("email") ?? $Doctordata["email"];


                $data = [
                    "id" => $id,
                    "name" => $name,
                    "email" => $email,
                    "role" => $role,
                    "gender" => $gender,
                    "expertise" => $expertise
                ];

                $result = $this->userModel->update($id , $data);

                if($result)
                {
                    return $this->respond([
                        "status" => true,
                        "mssge" => "updated Successfully",
                        "result" => $result
                    ]);
                }else{
                    
                    return $this->respond([
                        "status" => true,
                        "mssge" => "Failed to update the Doctors data",
                        "result" => $result
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

    public function deleteDoctors()
    {
       try{
        //    $userData = $this->request->userData;

        //     $user = $this->userModel->find($userData->user->id); 

        //     $userRole = $user['role'];

                $validationRules = [
                    "doctorId" => [
                        "rules" => "required"
                    ]
                ];


                if(!$this->validate($validationRules))
                {
                    return $this->respond([
                        "status" => false,
                        "Error" => $this->validator->getErrors(),
                    ]);
                }

                $id = $this->request->getVar("doctorId"); 

                // print_r($id);
                // exit;
                
                $result = $this->userModel->where("id" , $id)->delete();

                if($result)
                {
                    return $this->respond([
                        "status" => true,
                        "mssge" => "Deleted data of DoctorId " . $id ." Successfully",
                        "result" => $result
                    ]);
                }else{
                    
                    return $this->respond([
                        "status" => true,
                        "mssge" => "Failed to Delete the Doctors data",
                        "result" => $result
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

    public function EditPatient()
    {
        try{
           
            $id = $this->request->getVar("patientId"); 

            $PatientData = $this->userModel->where("id" , $id)->first();
            $name = $this->request->getVar("name") ?? $PatientData["name"];
            $role = $this->request->getVar("role") ?? $PatientData["role"];
            $gender = $this->request->getVar("gender") ?? $PatientData["gender"];
            $problem = $this->request->getVar("problem") ?? $PatientData["problem"];
            $email = $this->request->getVar("email") ?? $PatientData['email'];

            
            $data = [
                "id" => $id,
                "name" => $name,
                "role" => $role,
                "email" => $email,
                "gender" => $gender,
                "problem" => $problem,
            ];


            $result = $this->userModel->update($id , $data);


            if($result)
            {
                return $this->respond([
                    "status" => true,
                    "mssge" => "Edited Patient data Successfully",
                    "result" => $result
                ]);
            }else{
                
                return $this->respond([
                    "status" => true,
                    "mssge" => "Failed to Edit  the Patients data",
                    "result" => $result
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



    public function deletePatient()
    {
       try{
          
        $validationRules = [
            "patientId" => [
            "rules" => "required"
                    ]
                ];


            if(!$this->validate($validationRules))
            {
                return $this->respond([
                    "status" => false,
                    "Error" => $this->validator->getErrors(),
                ]);
            }


            $id = $this->request->getVar("patientId"); 

            
            $result = $this->userModel->where("id" , $id)->delete();
                

            if($result)
            {
                return $this->respond([
                    "status" => true,
                    "mssge" => "Deleted data of PatientId " . $id . " Successfully",
                    "result" => $result
                ]);
            }else{
                
                return $this->respond([
                    "status" => true,
                    "mssge" => "Failed to Delete the Patients data",
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
  

    public function getUser($userId = null)
    {
      try {
         if (!$userId) {
            $userId = $this->request->getVar('userId');
        }
        
        $user = $this->userModel->find($userId);
        
        if (!$user) {
            return $this->respond([
                "status" => false,
                "mssge" => "User not found"
            ]);
        }
        
        // Return user details without password
        unset($user['password']);
        
        return $this->respond([
            "status" => true,
            "data" => $user
        ]);
        
    } catch (\Exception $e) {
        return $this->respond([
            "status" => false,
            "mssge" => "Error fetching user details",
            "error" => $e->getMessage()
        ]);
    }
}

public function updateProfile()
{
    try {
        $userData = $this->request->userData;
        $userId = $userData->user->id;
        
        $validationRules = [
            "name" => [
                "rules" => "required"
            ],
            "email" => [
                "rules" => "required|valid_email"
            ],
            "gender" => [
                "rules" => "required"
            ]
        ];
        
        if (!$this->validate($validationRules)) {
            return $this->respond([
                "status" => false,
                "mssge" => "Validation failed",
                "error" => $this->validator->getErrors(),
            ]);
        }
        
        $data = [
            "name" => $this->request->getVar("name"),
            "email" => $this->request->getVar("email"),
            "gender" => $this->request->getVar("gender"),
        ];
        
        // Add optional fields
        if ($this->request->getVar("password")) {
            $data["password"] = $this->request->getVar("password");
        }
        
        if ($this->request->getVar("expertise")) {
            $data["expertise"] = $this->request->getVar("expertise");
        }
        
        if ($this->request->getVar("problem")) {
            $data["problem"] = $this->request->getVar("problem");
        }
        
        $result = $this->userModel->update($userId, $data);
        
        if (!$result) {
            return $this->respond([
                "status" => false,
                "mssge" => "Failed to update profile"
            ]);
        }
        
        // Get updated user data
        $user = $this->userModel->find($userId);
        unset($user['password']);
        
        return $this->respond([
            "status" => true,
            "mssge" => "Profile updated successfully",
            "data" => $user
        ]);
        
    } catch (\Exception $e) {
        return $this->respond([
            "status" => false,
            "mssge" => "Error updating profile",
            "error" => $e->getMessage()
        ]);
    }
}


public function stats()
{
    try{


        $doctorsCount = $this->userModel->where('role' , '1')->countAllResults();
        $patientsCount = $this->userModel->where('role' , '2')->countAllResults();

        $appointmentsCount = $this->appointmentModel->where('status' , 'booked')->countAllResults();


         return $this->respond([
            'doctors' => $doctorsCount,
            'patients' => $patientsCount,
            'appointments' => $appointmentsCount
        ]);

    }catch(\Exception $e)
    {
        return $this->respond([
            "status" => false,
            "Error" => $e->getMessage(),
        ]);
    }
}

public function getDetailsforPatient()
{
    try{

       $patientId = $this->request->getVar('patientId');

        if (!$patientId) 
        {
            $userData = $this->request->userData;
            $patientId = $userData->user->id;
        }

        $userDetails = $this->userModel->find($patientId);


       $data = [
        "name" => $userDetails['name'],
        "gender" => $userDetails['gender'],
        "DOB" => "12-08-2003",
        "email" => $userDetails['email'],
        "photo" => "/assets/images/dummyProfile.png"
       ];

       return $this->respond([
        "status" => true,
        "Mssge" => "Successfully fetched all the Basic Details",
        "data" => $data,
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
}
