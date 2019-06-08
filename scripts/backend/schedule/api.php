<?php

include_once __DIR__ . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR . "base" . DIRECTORY_SEPARATOR . "api.php";

const SCHEDULE_API = "schedule";

const SCHEDULE_DATABASE = __DIR__ . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR . "files" . DIRECTORY_SEPARATOR . "schedule" . DIRECTORY_SEPARATOR . "database.json";

const SCHEDULE_INITIAL_TIME = -1;
const SCHEDULE_TERMINAL_TIME = -2;

const SCHEDULE_SLOT_LENGTH = -3;

const SCHEDULE_INITIAL_MINUTE = ((SCHEDULE_INITIAL_TIME - SCHEDULE_INITIAL_TIME % 100) / 100) * 60 + (SCHEDULE_INITIAL_TIME % 100);
const SCHEDULE_TERMINAL_MINUTE = ((SCHEDULE_TERMINAL_TIME - SCHEDULE_TERMINAL_TIME % 100) / 100) * 60 + (SCHEDULE_TERMINAL_TIME % 100);

const SCHEDULE_ALLOW_DUPLICATES = false;

$schedule_database_file = SCHEDULE_DATABASE;
$schedule_database = null;

function schedule()
{
    schedule_load();
    return api(SCHEDULE_API, function ($action, $parameters) {
        if ($action === "read") {
            return [true, schedule_read()];
        } else if ($action === "write") {
            if ($parameters !== null && isset($parameters->name) && isset($parameters->time)) {
                return schedule_write($parameters->name, $parameters->time);
            }
        }
        return [false, null];
    }, true);
}

function schedule_database($database)
{
    global $schedule_database_file;
    $schedule_database_file = $database;
}

function schedule_load()
{
    global $schedule_database, $schedule_database_file;
    if ($schedule_database === null)
        $schedule_database = json_decode(file_get_contents($schedule_database_file));
}

function schedule_read()
{
    global $schedule_database;
    $schedule = new stdClass();
    for ($time = SCHEDULE_INITIAL_MINUTE; $time < SCHEDULE_TERMINAL_MINUTE; $time += SCHEDULE_SLOT_LENGTH) {
        if (isset($schedule_database->$time)) {
            $schedule->$time = $schedule_database->$time;
        } else {
            $schedule->$time = null;
        }
    }
    return $schedule;
}

function schedule_write($name, $time)
{
    global $schedule_database;
    if (is_string($name) && strlen($name) > 0) {
        if (is_numeric($time) && $time >= SCHEDULE_INITIAL_MINUTE && $time <= SCHEDULE_TERMINAL_MINUTE && !isset($schedule_database->$time)) {
            if (SCHEDULE_ALLOW_DUPLICATES) {
                $schedule_database->$time = $name;
                schedule_save();
                return [true, null];
            } else {
                foreach ($schedule_database as $current) {
                    if ($current === $name) return [false, "Name exists already"];
                }
                $schedule_database->$time = $name;
                schedule_save();
                return [true, null];
            }
        }
        return [false, "Invalid time"];
    }
    return [false, "Invalid name"];
}

function schedule_save()
{
    global $schedule_database, $schedule_database_file;
    file_put_contents($schedule_database_file, json_encode($schedule_database));
}