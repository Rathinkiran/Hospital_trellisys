<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class UpdatedVisitRecordsMigration extends Migration
{
    public function up()
    {
         $this->db->query("ALTER TABLE `visit_records` DROP FOREIGN KEY `visit_records_patient_id_foreign`");
        $this->db->query("ALTER TABLE `visit_records` DROP FOREIGN KEY `visit_records_doctor_id_foreign`");

        // Change isDeleted column to tinyint(1) with default 0
        $this->db->query("
            ALTER TABLE `visit_records`
            MODIFY `isDeleted` TINYINT(1) NOT NULL DEFAULT 0
        ");
    }

    public function down()
    {
        //
    }
}
