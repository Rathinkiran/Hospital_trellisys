<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;

class DoctorController extends ResourceController
{

    private $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
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
}
