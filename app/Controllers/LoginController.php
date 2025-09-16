<?php

namespace App\Controllers;

use App\Models\UserModel as ModelsUserModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use PHPUnit\TextUI\XmlConfiguration\Validator;

class LoginController extends ResourceController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    public function register() // Oly patients can Register
    {
        $validationRules = [
            "name" => [
               "rules" => "required|min_length[3]"
            ],
            "gender" => [
                "rules" => "required"
            ],
            "email" => [
                "rules" => "required|min_length[3]|valid_email"
            ],
            "password" => [
                "rules" => "required|min_length[3]"
            ],
            "problem" => [
                "rules" => "required",
            ]
            ];

            if(!$this->validate($validationRules))
            {
                return $this->respond([
                    "status" => false,
                    "error" => $this->validator->getErrors(),
                ]);
            }

            $name = $this->request->getVar("name");
            $email = $this->request->getVar("email");
            $gender = $this->request->getVar("gender");
            $password = $this->request->getVar("password");
            $problem = $this->request->getVar("problem");
            $role = "2";

            $data = [
                "name" => $name,
                "email" => $email,
                "gender" => $gender,
                "role" => $role,
                "password" => $password,
                "problem" => $problem,
            ];

            $result = $this->userModel->insert($data);

            return $this->respond([
                "status" => true,
                "mssge" => "Registered Successfully",
                "result" => $result,
            ]);

    }


   public function login()
   {
     $validationRules = [
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
          "error" => $this->validator->getErrors(),
        ]);
     }

     $email = $this->request->getVar('email');

     $user = $this->userModel->where("email" , $email)->first();


     if(!$user)
     {
        return $this->respond([
            "status" => false,
            "mssge" => "User does not exist"
        ]);
     }

     $payloadData = [
                    "iss" => "localhost",
                    "aud" => "localhost",
                    "iat" => time(),
                    "exp" => time() + 3600, //Token value will expire after 1 hour
                    "user" => [
                        "id" => $user["id"],
                        "email" => $user["email"],
                        "role"  => $user['role']
                    ],
                ];
           
                $token = JWT::encode($payloadData , getenv('JWT_KEY') , 'HS256');

                return $this->respond([
                    "status" => true,
                    "mssge" => "Login Successful",
                    "token" => $token,
                    "role" => $user["role"],
                ]);

   }

   
}
