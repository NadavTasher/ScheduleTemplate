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
    console.log(slotArray);
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
    let form = new FormData();
    form.append("action", "read");
    fetch("php/schedule/schedule.php", {
        method: "post",
        body: form
    }).then(response => {
        response.text().then((result) => {
            let json = JSON.parse(result);
            if (json.hasOwnProperty("read")) {
                if (json.read.hasOwnProperty("success")) {
                    if (json.read.success) {
                        if (json.read.hasOwnProperty("list")) {
                            callback(json.read.list);
                        }
                    }
                }
            }
        });
    });
}

function write(name, time) {
    let form = new FormData();
    form.append("action", "write");
    form.append("write", JSON.stringify({
        name: name,
        time: time
    }));
    fetch("php/schedule/schedule.php", {
        method: "post",
        body: form
    }).then(response => {
        response.text().then((result) => {
            let json = JSON.parse(result);
            if (json.hasOwnProperty("write")) {
                if (json.write.hasOwnProperty("success")) {
                    if (json.write.success) {
                        hide("error");
                        window.location.reload(true);
                    } else {
                        show("error");
                        get("name").value = "";
                    }
                }
            }
        });
    });
}