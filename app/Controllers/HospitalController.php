<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\HospitalsModel;

class HospitalController extends ResourceController
{
    private $hospitalModel;


    public function __construct()
    {
        $this->hospitalModel = new HospitalsModel();
    }

    
  public function listAllHospitals()
  {
    try 
    {
       $data = $this->hospitalModel->findAll();

       return $this->respond([
        "status" => true,
        "Mssge" => "Fetched all the hospitals list successfully",
        "data" => $data
       ]);

    }catch(\Exception $e)
    {
        return $this->respond([
            "status" => false,
            "Error" => $e->getMessage()
        ]);
    }

   
  }


   public function gethospitalInfo()
    {
        try{
            $hospital_id = $this->request->hospital_id;
            if(!$hospital_id)
            {
                $hospital_id = $this->request->getVar("hospital_id");
            }

            $data = $this->hospitalModel->find($hospital_id);

            return $this->respond([
                "status" => true,
                "Mssge" => "Successfully fetched the Hospital Info",
                "data" => $data
            ]);

             
        }catch(\Exception $e)
        {
            return $this->respond([
                "status" => false,
                "Error" => $e->getMessage()
            ]);
        }
    }
}
