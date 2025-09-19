<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class UpdatedAppointmentMigration extends Migration
{
    public function up()
    {
        $this->forge->addColumn("appointments" ,  [
             "status" => [
                "type" => "ENUM",
                "constraint" => ["rescheduled" , "booked" , "completed" , "cancelled"],
                "null" => false,
                "default" => "booked",
                "after" => "id"
             ],
             "rescheduled_from" => [
                "type" => "INT",
                "unsigned" => true,
                "null" => true,
                "after" => "status"
            ],
            "reschedule_reason" => [
                "type" => "TEXT",
                "null" => true,
                "after" => "rescheduled_from"
            ],
            "created_at datetime default current_timestamp",
            //  => [
            //     "type" => "DATETIME",
            //     "null" => false,
            //     "default" => "CURRENT_TIMESTAMP",
            //     "after" => "reschedule_reason"
            // ],
            "updated_at" => [
                "type" => "DATETIME",
                "null" => true,
                "after" => "created_at"
            ],
        ]);

        $this->db->query("
            ALTER TABLE `appointments`
            ADD CONSTRAINT `fk_rescheduled_from`
            FOREIGN KEY (`rescheduled_from`)
            REFERENCES `appointments`(`id`)
            ON DELETE SET NULL
            ON UPDATE CASCADE
            ");


            $this->db->query("
            ALTER TABLE `appointments`
            MODIFY `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ");
    }

    public function down()
    {
        $this->db->query("ALTER TABLE `appointments` DROP FOREIGN KEY `fk_rescheduled_from`");
        $this->forge->dropColumn('appointments' , ["status" , "rescheduled_from" , "reschedule_reason" , "created_at" , "updated_at"]);

    }
}
