<?php

namespace App\Controllers;
defined('/c/xampp/php/php') OR exit('No direct script access allowed');

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\AppointmentModel;

class Cronjobs extends BaseController
{
    private $AppointmentModel;
    public function __construct()
    {
        parent::__construct();
        $AppointmentModel = new AppointmentModel();
    }

    //Cron method cancel pending appointments
    public function cancelPendingAppointments()
    {
        if(!$this->input->is_cli_request())
        {
            echo "This script can oly be run from CLI.\n";
            return;
        }

        $appointments = $this->AppointmentModel->getPendingOlderThan24Hours();

        if(empty($appointments))
        {
            echo "No appointments to cancel.\n";
            return;
        }

        foreach($appointments as $appt)
        {
            $this->AppointmentModel->updateStatus($appt->id,'cancelled');
            echo "Cancelled appointment ID ".$appt->id."\n";
        }

        echo "Cron job executed successfully.\n";
    }
}
