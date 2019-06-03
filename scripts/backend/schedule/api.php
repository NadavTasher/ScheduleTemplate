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

$schedule_database = json_decode(file_get_contents(SCHEDULE_DATABASE));

function schedule()
{
    if (isset($_POST["schedule"])) {
        $information = json_decode(filter($_POST["schedule"]));
        if (isset($information->action) && isset($information->parameters)) {
            $action = $information->action;
            $parameters = $information->parameters;
            result(SCHEDULE_API, $action, "success", false);
            if ($action === "read") {
                result(SCHEDULE_API, "read", "success", true);
                result(SCHEDULE_API, "read", "list", schedule_read());
            } else if ($action === "write") {
                if ($parameters !== null && isset($parameters->name) && isset($parameters->time))
                    result(SCHEDULE_API, "write", "success", schedule_write($parameters->name, $parameters->time));
            }
            schedule_save();
        }
    }
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
                return true;
            } else {
                foreach ($schedule_database as $current) {
                    if ($current === $name) return false;
                }
                $schedule_database->$time = $name;
                return true;
            }
        }
    }
    return false;
}

function schedule_save()
{
    global $schedule_database;
    file_put_contents(SCHEDULE_DATABASE, json_encode($schedule_database));
}