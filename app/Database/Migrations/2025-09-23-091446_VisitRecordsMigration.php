<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class VisitRecordsMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            "id" => [
                "type" => "INT",
                "unsigned" => true,
                "contraint" => 5,
                "auto_increment" => true
            ],
            "appointment_id" => [
                "type" => "INT",
                "unsigned" => true,
                "constraint" => 5,
                "null" => false
            ],
            "patient_id" => [
                "type" => "INT",
                "unsigned" => true,
                "constraint" => 5,
                "null" => false
            ],
            "doctor_id" => [
                "type" => "INT",
                "unsigned" => true,
                "constraint" => 5,
                "null" => false
            ],
            "reason" => [
                "type" => "TEXT",
                "null" => false,
            ],
            "weight" => [
                "type" => "DECIMAL",
                "constraint" => "5,2",
                "null" => false,

            ],
            "bp_systolic" => [
                "type" => "INT",
                "null" => false,
            ],
            "bp_diastolic" => [
                "type" => "INT",
                "null" => false,
            ],
            "doctor_comment" => [
                "type" => "TEXT",
                "null" => false
            ],
            "created_at datetime default current_timestamp",
            "updated_at" => [
                "type" => "DATETIME",
                "after" => "created_at"
            ],
            "deleted_at" => [
                "type" => "DATETIME",
                "null" => true,
            ],
            "deleted_by" => [
                "type" => "INT",
                "unsigned" => true,
                "constraint" => 5,
                "null" => true,
            ],
            "isDeleted" => [
                "type" => "TINYINT",
                "unsigned" => true,
                "constraint" => 5,
                "null" => true,
            ],
        ]);


        $this->forge->addPrimaryKey("id");
        $this->forge->addForeignKey("appointment_id" , "appointments" , "id" , "CASCADE" , "CASCADE");
        $this->forge->addForeignKey("patient_id" , "appointments" , "patient_id" , "CASCADE" , "CASCADE");
        $this->forge->addForeignKey("doctor_id" , "appointments" , "doctor_id" , "CASCADE" , "CASCADE");
        $this->forge->createTable("visit_records");

        
        $this->db->query("
            ALTER TABLE `visit_records`
            MODIFY `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ");


        
    }

    public function down()
    {
        $this->forge->dropTable("visit_records");
    }
}
