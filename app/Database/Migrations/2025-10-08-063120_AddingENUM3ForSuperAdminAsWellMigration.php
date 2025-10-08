<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddingENUM3ForSuperAdminAsWellMigration extends Migration
{
    public function up()
    {
         $this->db->query("
            ALTER TABLE `users`
            MODIFY COLUMN `role` ENUM('0','1','2','3') NOT NULL 
            COMMENT '0 = Admin, 1 = Doctor, 2 = Patient, 3 = SuperAdmin';
        ");
    }

    public function down()
    {
        $this->db->query("
            ALTER TABLE `users`
            MODIFY COLUMN `role` ENUM('0','1','2') NOT NULL 
            COMMENT '0 = Admin, 1 = Doctor, 2 = Patient';
        ");
    }
}
