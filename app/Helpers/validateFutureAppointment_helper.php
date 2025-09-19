<?php
use CodeIgniter\I18n\Time;

function validateFutureAppointment(string $date, string $time, string $timezone = 'Asia/Kolkata'): array
    {
        $currentDateTime = new DateTime("now", new DateTimeZone($timezone));
        $newDateTime     = new DateTime("$date $time", new DateTimeZone($timezone));

        // Case 1: must be in the future
        if ($newDateTime <= $currentDateTime) {
            return [
                'status'  => false,
                'message' => 'Appointment must be scheduled in the future',
            ];
        }

        // Case 2: same day -> must be at least 1 hour later
        if ($newDateTime->format("Y-m-d") === $currentDateTime->format("Y-m-d")) {
            $minAllowed = clone $currentDateTime;
            $minAllowed->modify("+1 hour");

            if ($newDateTime < $minAllowed) {
                return [
                    'status'  => false,
                    'message' => 'For same-day appointments, time must be at least 1 hour later than now',
                ];
            }
        }

        return ['status' => true, 'message' => 'Valid appointment slot'];
    }
?>