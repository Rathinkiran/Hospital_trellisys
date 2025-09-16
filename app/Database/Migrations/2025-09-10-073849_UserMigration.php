<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class UserMigration extends Migration
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
        "name" => [
            "type" => "VARCHAR",
            "constraint" => 30,
            "null" => false,
        ],
        // "email" => [
        //     "type" => "VARCHAR",
        //     "constraint" => 50,
        //     "null" => false,
        // ],
        // "password" => [
        //     "type" => "VARCHAR",
        //     "constraint" => 80,
        //     "null" => false,
        // ],
        "role" => [
             "type" => "ENUM",
             "constraint" => [ "0" , "1" , "2"],  // 0 - Admin 
             "null" => false                      // 1 - doctor
        ],                                        // 2 - patient
        "gender" => [
            "type" => "ENUM",
            "constraint" => ["male" , "female"],
            "null" => false
        ],
        "expertise" => [
            "type" => "VARCHAR",
            "null" => true,
            "constraint" => 30
        ],
        "problem" => [
            "type" => "VARCHAR",
            "null" => true,
            "constraint" => 30
        ],
    ]);

    $this->forge->addPrimaryKey("id");
    $this->forge->createTable("users");
    }

    public function down()
    {
        $this->forge->dropTable("users");
    }
}
