<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddingParentIdMigration extends Migration
{
    public function up()
    {
        $this->forge->addColumn("appointments" , [
            "parent_id" => [
                "type" => "INT",
                "unsigned" => true,
                "constraint" => 5,
                "null" => true,
            ]
            ]);

            $this->db->query("
            ALTER TABLE `appointments`
            ADD CONSTRAINT `parent_id`
            FOREIGN KEY (`parent_id`)
            REFERENCES `appointments`(`id`)
            ON DELETE SET NULL
            ON UPDATE CASCADE
            ");


    }

    public function down()
    {
        $this->db->query("ALTER TABLE `appointments` DROP FOREIGN KEY `parent_id`");
        $this->forge->dropColumn("appointments" , ["parent_id"]);
    }
}
