/**
 * Copyright (c) 2019 Nadav Tasher
 * https://github.com/NadavTasher/ScheduleTemplate/
 **/

const SCHEDULE_API = "schedule";
const SCHEDULE_ENDPOINT = document.getElementsByName("endpoint")[0].getAttribute("content");

function schedule() {
    view("home");
    read(display);
}

function bubble(slotArray) {
    let changes = 0;
    for (let i = 0; i < slotArray.length; i++) {
        if (i < slotArray.length - 1) {
            if (slotArray[i].hasOwnProperty("scheduleIndex") && slotArray[i + 1].hasOwnProperty("scheduleIndex")) {
                if (slotArray[i].scheduleIndex > slotArray[i + 1].scheduleIndex) {
                    let temporary = slotArray[i];
                    slotArray[i] = slotArray[i + 1];
                    slotArray[i + 1] = temporary;
                    changes++;
                }
            }
        }
    }
    if (changes > 0) slotArray = bubble(slotArray);
    return slotArray;
}

function display(schedule) {
    let slotArray = [];
    for (let key in schedule) {
        if (schedule.hasOwnProperty(key)) {
            let value = schedule[key];
            let minute = parseInt(key, 10);
            let slot = document.createElement("div");
            let time = document.createElement("p");
            slot.scheduleIndex = minute;
            time.innerText = (minute - minute % 60) / 60 + ":" + (minute % 60 < 10 ? "0" : "") + minute % 60;
            slot.appendChild(time);
            if (value === null) {
                let button = document.createElement("button");
                button.innerText = "Register";
                button.onclick = () => {
                    fill(minute);
                };
                slot.appendChild(button);
            } else {
                let name = document.createElement("p");
                name.innerText = value;
                slot.appendChild(name);
            }
            slotArray.push(slot);
        }
    }
    slotArray = bubble(slotArray);
    clear("schedule");
    for (let s = 0; s < slotArray.length; s++) {
        get("schedule").appendChild(slotArray[s]);
    }
}

function fill(time) {
    hide("error");
    view("fill");
    get("finish").onclick = () => {
        write(get("name").value, time);
    };
}

function read(callback) {
    api(SCHEDULE_ENDPOINT, SCHEDULE_API, "read", {}, (success, result, error) => {
        if (success) callback(result);
    });
}

function write(name, time) {
    api(SCHEDULE_ENDPOINT, SCHEDULE_API, "write", {
        name: name,
        time: time
    }, (success, result, error) => {
        if (success) {
            hide("error");
            window.location.reload(true);
        } else {
            show("error");
            get("error").innerText = error;
            get("name").value = "";
        }
    });
}