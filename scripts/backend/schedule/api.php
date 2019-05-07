<?php
const DATABASE = __DIR__ . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR . "files" . DIRECTORY_SEPARATOR . "schedule" . DIRECTORY_SEPARATOR . "database.json";
const INITIAL_TIME = -1;
const TERMINAL_TIME = -2;
const SLOT_TIME = -3;
const INITIAL_MINUTE = ((INITIAL_TIME - INITIAL_TIME % 100) / 100) * 60 + (INITIAL_TIME % 100);
const TERMINAL_MINUTE = ((TERMINAL_TIME - TERMINAL_TIME % 100) / 100) * 60 + (TERMINAL_TIME % 100);
const DUPLICATES = false;

$database = json_decode(file_get_contents(DATABASE));
$result = new stdClass();

function schedule()
{
    if (isset($_POST["schedule"])) {
        $information = json_decode(filter($_POST["schedule"]));
        if (isset($information->action) && isset($information->parameters)) {
            $action = $information->action;
            $parameters = $information->parameters;
            if ($action === "read") {
                result("read", "success", true);
                result("read", "list", read());
            } else if ($action === "write") {
                result("write", "success", false);
                if ($parameters !== null && isset($parameters->name) && isset($parameters->time))
                    result("write", "success", write($parameters->name, $parameters->time));
            }
            save();
        }
    }
}

function filter($source)
{
    // Filter inputs from XSS and other attacks
    $source = str_replace("<", "", $source);
    $source = str_replace(">", "", $source);
    return $source;
}

function result($type, $key, $value)
{
    global $result;
    if (!isset($result->$type)) $result->$type = new stdClass();
    $result->$type->$key = $value;
}

function read()
{
    global $database;
    $schedule = new stdClass();
    for ($time = INITIAL_MINUTE; $time < TERMINAL_MINUTE; $time += SLOT_TIME) {
        if (isset($database->$time)) {
            $schedule->$time = $database->$time;
        } else {
            $schedule->$time = null;
        }
    }
    return $schedule;
}

function write($name, $time)
{
    global $database;
    if (is_string($name) && strlen($name) > 0) {
        if (is_numeric($time) && $time >= INITIAL_MINUTE && $time <= TERMINAL_MINUTE && !isset($database->$time)) {
            if (DUPLICATES) {
                $database->$time = $name;
                return true;
            } else {
                foreach ($database as $current) {
                    if ($current === $name) return false;
                }
                $database->$time = $name;
                return true;
            }
        }
    }
    return false;
}

function save()
{
    global $database;
    file_put_contents(DATABASE, json_encode($database));
}