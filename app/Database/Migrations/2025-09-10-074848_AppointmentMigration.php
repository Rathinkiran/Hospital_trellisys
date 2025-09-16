<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use DateTime;

class AppointmentMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
        "id" => [
            "type" => "INT",
            "unsigned" => true,
            "auto_increment" => true,
            "constraint" => 5
        ],
        "doctor_id" => [
            "type" => "INT",
            "unsigned" => true,
            "constraint" => 5,
            "null" => false
        ],
        "patient_id" => [
            "type" => "INT",
            "unsigned" => true,
            "constraint" => 5,
            "null" => false
        ],
        "Appointment_date" => [
               "type" => "DATE",
               "null" => false,
        ],
        "Appointment_startTime" => [
                "type" => "TIME",
                "null" => false,
        ],
        "Appointment_endTime" => [
                "type" => "TIME",
                "null" => false,
        ],
    ]);

    
    $this->forge->addPrimaryKey("id");
    $this->forge->addForeignKey("doctor_id"  , "users" , "id" );
    $this->forge->addForeignKey("patient_id"  , "users" , "id");

    $this->forge->createTable("appointments");
    }

    public function down()
    {
        $this->forge->dropTable("appointments");
    }
}
