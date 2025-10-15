<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddingPendingStatusToAppointmentsTableMigration extends Migration
{
    public function up()
    {
        $this->db->query("
            ALTER TABLE `appointments`
            MODIFY `status` ENUM('pending', 'rescheduled', 'booked', 'completed', 'cancelled')
            NOT NULL DEFAULT 'pending';
        ");
    }

    public function down()
    {
        $this->db->query("
            ALTER TABLE `appointments`
            MODIFY `status` ENUM('rescheduled', 'booked', 'completed', 'cancelled')
            NOT NULL DEFAULT 'booked';
        ");
    }
}
