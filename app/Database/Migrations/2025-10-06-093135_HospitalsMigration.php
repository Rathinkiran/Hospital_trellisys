<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class HospitalsMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            "id" => [
                "type" => "INT",
                "auto_increment" => true,
                "unsigned" => true,
                "constraint" => 5
            ],
            "name" => [
                "type" => "VARCHAR",
                "constraint" => 30,
                "null" => false
            ],
            "address" => [
                "type" => "TEXT",
                "null" => false, 
            ],
            "contact_no" => [
                "type" => "VARCHAR",
                "constraint" => 15,
                "null" => true,
                "default" => null
            ],
            "isDeleted" => [
               "type" => "TINYINT",
                "unsigned" => true,
                "null" => true,
                "default" => 0
            ],
            "created_at datetime default current_timestamp",
            "updated_at" => [
                "type" => "DATETIME",
                "after" => "created_at"
            ],
        ]);
        $this->forge->addPrimaryKey("id");
        $this->forge->createTable("hospitals");

        

        $this->db->query("
            ALTER TABLE `hospitals`
            MODIFY `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ");
    }

    public function down()
    {
        $this->forge->dropTable("hospitals");
    }
}
