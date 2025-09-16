<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddEmailAndPassword extends Migration
{
    public function up()
    {
        $this->forge->addColumn("users" , [
             "email" => [
                "type" => "VARCHAR",
                "constraint" => 50,
                "null" => false,
            ],
            "password" => [
                "type" => "VARCHAR",
                "constraint" => 80,
                "null" => false,
            ],
        ]);
    }

    public function down()
    {
        //
    }
}
