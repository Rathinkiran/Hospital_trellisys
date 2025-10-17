<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddingIsDeletedColumnToUsersTable extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users', [
            'isDeleted' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'null'       => false,
                'default'    => 0,
                'comment'    => '0 = Active, 1 = Deleted'
            ]
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('users', 'isDeleted');
    }
}
