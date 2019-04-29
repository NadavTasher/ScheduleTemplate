<?php
const DATABASE = __DIR__ . "/../../files/schedule/database.json";
const INITIAL_TIME = 420;
const TERMINAL_TIME = 720;
const SLOT_TIME = 5;
const DUPLICATES = false;

$database = json_decode(file_get_contents(DATABASE));
$result = new stdClass();

function schedule()
{
    if (isset($_POST["action"])) {
        $action = $_POST["action"];
        $parameters = null;
        if (isset($_POST[$action]))
            $parameters = json_decode(filter($_POST[$action]));
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
    for ($time = INITIAL_TIME; $time < TERMINAL_TIME; $time += SLOT_TIME) {
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
        if (is_numeric($time) && $time >= INITIAL_TIME && $time <= TERMINAL_TIME && !isset($database->$time)) {
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