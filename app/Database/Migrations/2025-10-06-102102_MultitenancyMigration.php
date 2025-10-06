<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class MultitenancyMigration extends Migration
{
    public function up()
    {
        $this->db->query('ALTER TABLE users
                          ADD COLUMN hospital_id INT UNSIGNED  AFTER id,
                          ADD FOREIGN KEY (hospital_id) REFERENCES hospitals(id)');


        $this->db->query('ALTER TABLE appointments
                          ADD COLUMN hospital_id INT UNSIGNED  AFTER id,
                          ADD FOREIGN KEY (hospital_id) REFERENCES hospitals(id)');

       $this->db->query('ALTER TABLE visit_records
                          ADD COLUMN hospital_id INT UNSIGNED  AFTER id,
                          ADD FOREIGN KEY (hospital_id) REFERENCES hospitals(id)');
   
    }

    public function down()
    {
        $this->forge->dropColumn("users" , "hospital_id");
        $this->forge->dropColumn("appointments" , "hospital_id");
        $this->forge->dropColumn("visit_records" , "hospital_id");
    }
}
