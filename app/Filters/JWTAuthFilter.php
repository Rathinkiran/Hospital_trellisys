<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;



class JWTAuthFilter implements FilterInterface
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
    public function before(RequestInterface $request, $arguments = null)
    {
        $AuthorizationHeader = $request->getServer("HTTP_AUTHORIZATION");

        if(!$AuthorizationHeader)
        {
            return Services::response()->setStatusCode(403)->setJSON([
                "status" => false,
                "mssge" => "Login to proceed further",
            ]);
        }

        $AuthorizationStringArr = explode(' ', $AuthorizationHeader);

        if((count($AuthorizationStringArr) !== 2) || ($AuthorizationStringArr[0] != "Bearer"))
        {
           return Services::response()->setStatusCode(403)->setJSON([
            "status" => false,
            "mssge" => "Unathorized Access , Invalid token or Expired"
           ]);
        }

        try{
          
            $decoded = JWT::decode($AuthorizationStringArr[1] , new Key(getenv('JWT_KEY') , 'HS256'));

            $request->jwtToken = $AuthorizationStringArr[1];
            $request->userData = $decoded;
            $request->role = $decoded->user->role;
        }catch(\Exception $e)
        {
            return Services::response()->setStatusCode(500)->setJSON([
                "status" => false,
                "mssge" => "Failed to validate the token",
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
