<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddingPhoneNoMigration extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users' , [
            'phone_no' => [
                "type" => "VARCHAR",
                "constraint" => 15,
                "null" => true,
                "default" => null
            ]
            ]);
    }

    public function down()
    {
        //
    }
}
