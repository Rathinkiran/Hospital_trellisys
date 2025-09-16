<?php 




function convertToDatabaseTime($time12Hour)
{   
    $dateTime = DateTime::createFromFormat('h:i A', $time12Hour);
    if (!$dateTime) {
        throw new \Exception("Invalid time format. Please use format like '09:30 AM'");
    }
    return $dateTime->format('H:i:s');
}

?>