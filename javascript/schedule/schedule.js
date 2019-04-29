function schedule() {
    read(displaySchedule);
}

function displaySchedule(schedule) {
    let slotArray = [];
    for (let time in schedule) {
        if (schedule.hasOwnProperty(time)) {
            let name = schedule[time];
            if (name.length === 0) {
            }
            console.log(name);

        }
    }
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
                            callback(json.list);
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
                    if (json.write.success)
                        window.location.reload(true);
                }
            }
        });
    });
}