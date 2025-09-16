<?php 

 function addHoursToTime($time, $hoursToAdd = 1)
{
    $dateTime = DateTime::createFromFormat('H:i:s', $time);
    $dateTime->modify("+{$hoursToAdd} hour");
    return $dateTime->format('H:i:s');
}
?>