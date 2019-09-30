/**
 * Copyright (c) 2019 Nadav Tasher
 * https://github.com/NadavTasher/WebAppBase/
 **/

/* API */

function api(endpoint = null, api = null, action = null, parameters = null, callback = null, form = body()) {
    fetch(endpoint, {
        method: "post",
        body: body(api, action, parameters, form)
    }).then(response => {
        response.text().then((result) => {
            if (callback !== null && api !== null && action !== null) {
                let json = JSON.parse(result);
                if (json.hasOwnProperty(api)) {
                    if (json[api].hasOwnProperty("status") && json[api].hasOwnProperty("result")) {
                        if (json[api]["status"].hasOwnProperty(action) && json[api]["result"].hasOwnProperty(action)) {
                            let status = json[api]["status"][action];
                            let result = json[api]["result"][action];
                            if (status === true) {
                                callback(true, result, null);
                            } else {
                                callback(false, null, status);
                            }
                        }
                    } else {
                        callback(false, null, "Base API not detected in JSON");
                    }
                } else {
                    callback(false, null, "Base API (\"" + api + "\") not found in JSON");
                }
            }
        });
    });
}

function body(api = null, action = null, parameters = null, form = new FormData()) {
    if (api !== null && action !== null && parameters !== null && !form.has(api)) {
        form.append(api, JSON.stringify({
            action: action,
            parameters: parameters
        }));
    }
    return form;
}

function popup(contents, color = null, timeout = 2000, onclick = null) {
    let div = make("div");
    // Make the prompt horizontal and button-like
    row(div);
    input(div);
    // OnClick
    div.onclick = (onclick !== null) ? onclick : () => {
        div.onclick = null;
        animate(div, "opacity", ["1", "0"], 0.5, () => {
            div.parentElement.removeChild(div);
        });
    };
    // Style
    div.style.position = "fixed";
    div.style.bottom = "0";
    div.style.left = "0";
    div.style.right = "0";
    div.style.margin = "1vh";
    div.style.padding = "1vh";
    div.style.height = "6vh";
    if (color !== null)
        div.style.backgroundColor = color;
    // Contents
    div.innerHTML = contents.innerHTML;
    // Animate
    animate(div, "opacity", ["0", "1"], 0.5, () => {
        if (timeout > 0) {
            setTimeout(() => {
                if (div.onclick !== null)
                    div.onclick(null);
            }, timeout);
        }
    });
    // Add To Body
    document.body.appendChild(div);
}

function download(file, data, type = "text/plain", encoding = "utf8") {
    let link = document.createElement("a");
    link.download = file;
    link.href = "data:" + type + ";" + encoding + "," + data;
    link.click();
}

function html(callback = null) {
    fetch("layouts/template.html", {
        method: "get"
    }).then(response => {
        response.text().then((template) => {
            fetch("layouts/app.html", {
                method: "get"
            }).then(response => {
                response.text().then((app) => {
                    document.body.innerHTML = template.replace("<!--App Body-->", app);
                    if (callback !== null) callback();
                });
            });
        });
    });
}

function instruct(title = null, safaricheck = true, callback = null) {
    // Check user-agent
    let agent = window.navigator.userAgent.toLowerCase();
    let devices = ["iphone", "ipad", "ipod"];
    let mobilesafari = false;
    for (let i = 0; i < devices.length; i++) {
        if (agent.includes(devices[i])) mobilesafari = true;
    }
    if ((mobilesafari && !("standalone" in window.navigator && window.navigator.standalone)) || !safaricheck) {
        let div = make("div");
        let text = make("p");
        let share = make("img");
        let then = make("p");
        let add = make("img");
        text.innerText = "To add " + ((title === null) ? ("\"" + document.title + "\"") : title) + ", ";
        share.src = "resources/svg/icons/safari/share.svg";
        then.innerText = "then";
        add.src = "resources/svg/icons/safari/add.svg";
        text.style.fontStyle = "italic";
        then.style.fontStyle = "italic";
        text.style.maxHeight = "5vh";
        share.style.maxHeight = "4vh";
        then.style.maxHeight = "5vh";
        add.style.maxHeight = "4vh";
        div.appendChild(text);
        div.appendChild(share);
        div.appendChild(then);
        div.appendChild(add);
        popup(div, "#ffffffee", 0);
    }
}

function theme(color) {
    let meta = document.getElementsByTagName("meta")["theme-color"];
    if (meta !== null) {
        meta.content = color;
    } else {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = color;
        document.head.appendChild(meta);
    }

}

function title(title) {
    document.title = title;
}

function worker(w = "worker.js") {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(w).then((result) => {
        });
    }
}

/* Visuals */

const LEFT = false;
const RIGHT = !LEFT;
const IN = true;
const OUT = !IN;

function animate(v, property = "left", stops = ["0px", "0px"], length = 1, callback = null) {
    let view = get(v);
    let interval = null;
    let next = () => {
        view.style[property] = stops[0];
        stops.splice(0, 1);
    };
    let loop = () => {
        if (stops.length > 0) {
            next();
        } else {
            clearInterval(interval);
            view.style.removeProperty("transitionDuration");
            view.style.removeProperty("transitionTimingFunction");
            if (callback !== null) callback();
        }
    };
    next();
    interval = setInterval(loop, length * 1000);
    setTimeout(() => {
        view.style.transitionDuration = length + "s";
        view.style.transitionTimingFunction = "ease";
        loop();
    }, 0);
}

function clear(v) {
    let view = get(v);
    while (view.firstChild) {
        view.removeChild(view.firstChild);
    }
}

function exists(v) {
    return get(v) !== undefined;
}

function get(v) {
    return isString(v) ? document.getElementById(v) : v;
}

function hide(v) {
    get(v).style.display = "none";
}

function make(type, content = null, classes = []) {
    let made = document.createElement(type);
    if (content !== null) {
        if (!isString(content)) {
            made.appendChild(content);
        } else {
            made.innerText = content;
        }
    }
    for (let c = 0; c < classes.length; c++)
        made.classList.add(classes[c]);
    return made;
}

function page(from, to, callback = null) {
    let stepA = () => {
        slide(get(from), OUT, LEFT, 0.2, stepB);
    };
    let stepB = () => {
        let temporary = get(to);
        while (temporary.parentNode !== document.body && temporary.parentNode !== document.body) {
            view(temporary);
            temporary = temporary.parentNode;
        }
        view(temporary);
        slide(temporary, IN, RIGHT, 0.2, callback);
    };
    if (from === null)
        stepB();
    else
        stepA();
}

function show(v) {
    get(v).style.removeProperty("display");
}

function slide(v, motion = IN, direction = RIGHT, length = 0.2, callback = null) {
    let view = get(v);
    let style = getComputedStyle(view);
    let edge = (direction === RIGHT ? 1 : -1) * screen.width;
    let current = isNaN(parseInt(style.left)) ? 0 : parseInt(style.left);
    let origin = current === 0 && motion === IN ? edge : current;
    let destination = motion === IN ? 0 : edge;
    if (getComputedStyle(view).position === "static" ||
        getComputedStyle(view).position === "sticky")
        view.style.position = "relative";
    animate(view, "left", [origin + "px", destination + "px"], length, callback);
}

function view(v) {
    let element = get(v);
    let parent = element.parentNode;
    for (let n = 0; n < parent.children.length; n++) {
        hide(parent.children[n]);
    }
    show(element);
}

function visible(v) {
    return (get(v).style.getPropertyValue("display") !== "none");
}

/* Special HTML */

function column(v) {
    get(v).setAttribute("column", true);
    get(v).setAttribute("row", false);
}

function input(v) {
    get(v).setAttribute("input", true);
}

function row(v) {
    get(v).setAttribute("row", true);
    get(v).setAttribute("column", false);
}

function text(v) {
    get(v).setAttribute("text", true);
}

/* UI */

function gestures(up = null, down = null, left = null, right = null, upgoing = null, downgoing = null, leftgoing = null, rightgoing = null) {
    let touchX, touchY, deltaX, deltaY;
    document.ontouchstart = (event) => {
        touchX = event.touches[0].clientX;
        touchY = event.touches[0].clientY;
    };
    document.ontouchmove = (event) => {
        deltaX = touchX - event.touches[0].clientX;
        deltaY = touchY - event.touches[0].clientY;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                if (leftgoing !== null) leftgoing();
            } else {
                if (rightgoing !== null) rightgoing();
            }
        } else {
            if (deltaY > 0) {
                if (upgoing !== null) upgoing();
            } else {
                if (downgoing !== null) downgoing();
            }
        }

    };
    document.ontouchend = () => {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                if (left !== null) left();
            } else {
                if (right !== null) right();
            }
        } else {
            if (deltaY > 0) {
                if (up !== null) up();
            } else {
                if (down !== null) down();
            }
        }
        touchX = null;
        touchY = null;
    };
}

/* Utils */

function isArray(a) {
    return a instanceof Array;
}

function isObject(o) {
    return o instanceof Object && !isArray(o);
}

function isString(s) {
    return (typeof "" === typeof s || typeof '' === typeof s);
}








