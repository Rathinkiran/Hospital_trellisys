<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddingCodeColumnToHospitalsMigration extends Migration
{
    public function up()
    {
        $this->forge->addColumn("hospitals" , [
            "code" => [
                "type" => "VARCHAR",
                "constraint" => 10,
                "null" => false,
            ]
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn("hospitals" , "code");
    }
}
