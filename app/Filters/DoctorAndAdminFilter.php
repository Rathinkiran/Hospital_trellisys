<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\UserModel;
use Config\Services;

class DoctorAndAdminFilter implements FilterInterface
{
    /**
     * Do whatever processing this filter needs to do.
     * By default it should not return anything during
     * normal execution. However, when an abnormal state
     * is found, it should return an instance of
     * CodeIgniter\HTTP\Response. If it does, script
     * execution will end and that Response will be
     * sent back to the client, allowing for error pages,
     * redirects, etc.
     *
     * @param RequestInterface $request
     * @param array|null       $arguments
     *
     * @return RequestInterface|ResponseInterface|string|void
     */
    private $userModel;
    public function __construct()
    {
        $this->userModel = new UserModel();
    }


    public function before(RequestInterface $request, $arguments = null)
    {
       try{
         $userData = $request->userData;

       $user = $this->userModel->find($userData->user->id);

       if(!($user['role'] == '0' || $user['role'] == '1'))
       {
        return Services::response()->setStatusCode(403)->setJSON([
            "status" => false,
            "error" => "Access denied , Only Doctor/Admin can access"
        ]);
       }

       }
         catch(\Exception $e)
        {
          return Services::response()->setStatusCode(500)->setJSON([
            "status" => false,
            "error" => $e->getMessage(),
          ]);
        }
    }

    /**
     * Allows After filters to inspect and modify the response
     * object as needed. This method does not allow any way
     * to stop execution of other after filters, short of
     * throwing an Exception or Error.
     *
     * @param RequestInterface  $request
     * @param ResponseInterface $response
     * @param array|null        $arguments
     *
     * @return ResponseInterface|void
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        //
    }
}
