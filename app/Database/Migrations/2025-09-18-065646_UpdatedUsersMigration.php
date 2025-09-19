<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class UpdatedUsersMigration extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users' , [
            "created_at datetime default current_timestamp", 
            // => [
            //     "type" => "DATETIME",
            //     "null" => false,
            //     "default" => "CURRENT_TIMESTAMP"
            // ],
            "updated_at" => [
                "type" => "DATETIME",
                "null" => true,
                "after" => "created_at"
            ],
        ]);

        $this->db->query("
            ALTER TABLE `users`
            MODIFY `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ");
    }

    public function down()
    {
         $this->forge->dropColumn('users', ["created_at", "updated_at"]);
    }
}
