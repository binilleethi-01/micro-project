
// Student Registration

// USER-SPECIFIC STORAGE

function getUserDataKey(key) {
    let email = localStorage.getItem("currentUser") || "guest";
    return key + "_" + email;
}

function loadUserData(key) {

    let savedData = localStorage.getItem(getUserDataKey(key));

    if (savedData !== null) {
        return JSON.parse(savedData);
    }

    // Move old data to the first logged-in account
    let oldData = localStorage.getItem(key);

    if (oldData !== null && localStorage.getItem("currentUser")) {
        localStorage.setItem(getUserDataKey(key), oldData);
        localStorage.removeItem(key);
        return JSON.parse(oldData);
    }

    return [];
}

function saveUserData(key, data) {
    localStorage.setItem(getUserDataKey(key), JSON.stringify(data));
}


// STUDENT REGISTRATION - MULTIPLE ACCOUNTS

document.getElementById("registerForm")?.addEventListener("submit", function(event) {

    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim().toLowerCase();
    let regno = document.getElementById("regno").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    let message = document.getElementById("message");

    if (password !== confirmPassword) {
        message.innerText = "Passwords do not match!";
        return;
    }

    // Get registered students
    let students = JSON.parse(localStorage.getItem("students")) || [];

    // Migrate an older single account, if one exists
    let oldStudent = JSON.parse(localStorage.getItem("student"));

    if (oldStudent && !students.some(s => s.email.toLowerCase() === oldStudent.email.toLowerCase())) {
        students.push(oldStudent);
    }

    // Check duplicate email
    if (students.some(s => s.email.toLowerCase() === email)) {
        message.innerText = "This email is already registered!";
        return;
    }

    let student = {
        name: name,
        email: email,
        regno: regno,
        password: password
    };

    students.push(student);

    localStorage.setItem("students", JSON.stringify(students));

    alert("Registration successful! Please login.");

    window.location.href = "login.html";

});



// Student Login


// STUDENT LOGIN - MULTIPLE ACCOUNTS

document.getElementById("loginForm")?.addEventListener("submit", function(event) {

    event.preventDefault();

    let email = document.getElementById("loginEmail").value.trim().toLowerCase();
    let password = document.getElementById("loginPassword").value;

    let students = JSON.parse(localStorage.getItem("students")) || [];

    // Support an older single registered account
    let oldStudent = JSON.parse(localStorage.getItem("student"));

    if (oldStudent && !students.some(s => s.email.toLowerCase() === oldStudent.email.toLowerCase())) {
        students.push(oldStudent);
        localStorage.setItem("students", JSON.stringify(students));
    }

    let student = students.find(function(s) {
        return s.email.toLowerCase() === email && s.password === password;
    });

    if (student) {

        localStorage.setItem("currentUser", student.email);
        localStorage.setItem("loggedIn", "true");

        alert("Login Successful!");

        window.location.href = "dashboard.html";

    } else {

        document.getElementById("loginMessage").innerText =
            "Invalid email or password!";

    }

});



// DASHBOARD FUNCTIONALITY

if (window.location.pathname.endsWith("dashboard.html")) {

    let students = JSON.parse(localStorage.getItem("students")) || [];

    let currentEmail = localStorage.getItem("currentUser");

    let student = students.find(function(s) {
        return s.email === currentEmail;
    });

    if (localStorage.getItem("loggedIn") !== "true" || !student) {

        alert("Please login first!");
        window.location.href = "login.html";

    } else {

        document.getElementById("welcome").innerText =
            "Welcome, " + student.name + "!";

    }

}



// LOGOUT FUNCTIONALITY

document.getElementById("logout")?.addEventListener("click", function() {

    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");

    alert("You have logged out successfully!");

    window.location.href = "login.html";

});


// STUDY PLANNER FUNCTIONALITY

let schedules = loadUserData("schedules");

function displaySchedules() {

    let list = document.getElementById("scheduleList");

    if (!list) return;

    list.innerHTML = "";

    schedules.forEach(function(item, index) {

        let div = document.createElement("div");

        div.className = "schedule-item";

        let heading = document.createElement("h3");
        heading.innerText = item.subject;

        let topic = document.createElement("p");
        topic.innerText = "Topic: " + item.topic;

        let date = document.createElement("p");
        date.innerText = "Date: " + item.date;

        let time = document.createElement("p");
        time.innerText = "Time: " + item.time;

        let button = document.createElement("button");
        button.innerText = "Delete";
        button.className = "delete-btn";

        button.addEventListener("click", function() {
            deleteSchedule(index);
        });

        div.appendChild(heading);
        div.appendChild(topic);
        div.appendChild(date);
        div.appendChild(time);
        div.appendChild(button);

        list.appendChild(div);

    });

}

function deleteSchedule(index) {

    schedules.splice(index, 1);

    localStorage.setItem("schedules", JSON.stringify(schedules));

    displaySchedules();

}

document.getElementById("plannerForm")?.addEventListener("submit", function(event) {

    event.preventDefault();

    let subject = document.getElementById("subject").value;
    let topic = document.getElementById("topic").value;
    let date = document.getElementById("studyDate").value;
    let hour = document.getElementById("studyHour").value;
let minute = document.getElementById("studyMinute").value;
let period = document.getElementById("studyPeriod").value;

let time = hour.padStart(2, "0") + ":" +
           minute.padStart(2, "0") + " " + period;

    let schedule = {
        subject: subject,
        topic: topic,
        date: date,
        time: time
    };

    schedules.push(schedule);

  saveUserData("schedules", schedules);

    displaySchedules();

    document.getElementById("plannerForm").reset();

});

displaySchedules();


// TASK MANAGER

let tasks = loadUserData("tasks");

function displayTasks() {

    let taskList = document.getElementById("taskList");

    if (!taskList) return;

    taskList.innerHTML = "";

    tasks.forEach(function(task, index) {

        let div = document.createElement("div");
        div.className = "task-item";

        let heading = document.createElement("h3");
        heading.innerText = task.title;

        if (task.completed) {
            heading.className = "completed-task";
        }

        let subject = document.createElement("p");
        subject.innerText = "Subject: " + task.subject;

        let date = document.createElement("p");
        date.innerText = "Due Date: " + task.date;

        let priority = document.createElement("p");
        priority.innerText = "Priority: " + task.priority;

        let status = document.createElement("p");
        status.innerText = task.completed ?
            "Status: Completed" : "Status: Pending";

        let completeBtn = document.createElement("button");
        completeBtn.innerText = task.completed ?
            "Undo Complete" : "Mark Completed";

        completeBtn.addEventListener("click", function() {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
        });

        let deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", function() {
            tasks.splice(index, 1);
            saveTasks();
        });

        div.appendChild(heading);
        div.appendChild(subject);
        div.appendChild(date);
        div.appendChild(priority);
        div.appendChild(status);
        div.appendChild(completeBtn);
        div.appendChild(deleteBtn);

        taskList.appendChild(div);

    });
}

function saveTasks() {
    saveUserData("tasks", tasks);
    displayTasks();
}

document.getElementById("taskForm")?.addEventListener(
    "submit", function(event) {

        event.preventDefault();

        let task = {
            title: document.getElementById("taskTitle").value,
            subject: document.getElementById("taskSubject").value,
            date: document.getElementById("taskDate").value,
            priority: document.getElementById("taskPriority").value,
            completed: false
        };

        tasks.push(task);

        saveTasks();

        document.getElementById("taskForm").reset();
    }
);

displayTasks();


// SUBJECT MANAGER

let subjects = loadUserData("subjects");

function displaySubjects() {

    let subjectList = document.getElementById("subjectList");

    if (!subjectList) return;

    subjectList.innerHTML = "";

    subjects.forEach(function(subject, index) {

        let div = document.createElement("div");
        div.className = "subject-item";

        let heading = document.createElement("h3");
        heading.innerText = subject.name;

        let code = document.createElement("p");
        code.innerText = "Subject Code: " + subject.code;

        let button = document.createElement("button");
        button.innerText = "Delete";

        button.addEventListener("click", function() {
            subjects.splice(index, 1);
            saveSubjects();
        });

        div.appendChild(heading);
        div.appendChild(code);
        div.appendChild(button);

        subjectList.appendChild(div);

    });
}

function saveSubjects() {
    saveUserData("subjects", subjects);
    displaySubjects();
}

document.getElementById("subjectForm")?.addEventListener(
    "submit", function(event) {

        event.preventDefault();

        let name = document.getElementById("subjectName").value;
        let code = document.getElementById("subjectCode").value;

        let subject = {
            name: name,
            code: code
        };

        subjects.push(subject);

        saveSubjects();

        document.getElementById("subjectForm").reset();
    }
);

displaySubjects();


// STUDY CHATBOT

let sendButton = document.getElementById("sendMessage");

sendButton?.addEventListener("click", sendChatMessage);

document.getElementById("userMessage")?.addEventListener(
    "keydown", function(event) {
        if (event.key === "Enter") {
            sendChatMessage();
        }
    }
);

function sendChatMessage() {

    let input = document.getElementById("userMessage");
    let message = input.value.trim().toLowerCase();

    if (message === "") {
        return;
    }

    let chat = document.getElementById("chatMessages");

    let userDiv = document.createElement("div");
    userDiv.className = "user-message";
    userDiv.innerText = input.value;

    chat.appendChild(userDiv);

    let reply = "Sorry, I don't know that answer. Try asking about study tips, exams, HTML or time management.";

    if (message.includes("hello") || message.includes("hi")) {
        reply = "Hello! How can I help you with your studies?";
    }
    else if (message.includes("study tips")) {
        reply = "Make a timetable, study regularly, take short breaks and revise your lessons.";
    }
    else if (message.includes("exam")) {
        reply = "Prepare short notes, practise questions and revise important topics before exams.";
    }
    else if (message.includes("time")) {
        reply = "Create a daily timetable and complete important tasks first.";
    }
    else if (message.includes("html")) {
        reply = "HTML stands for HyperText Markup Language. It is used to create web pages.";
    }
    else if (message.includes("distraction")) {
        reply = "Keep your phone away while studying and study in a quiet place.";
    }
    else if (message.includes("thank")) {
        reply = "You're welcome! Keep learning and doing your best.";
    }

    let botDiv = document.createElement("div");
    botDiv.className = "bot-message";
    botDiv.innerText = reply;

    chat.appendChild(botDiv);

    input.value = "";
    chat.scrollTop = chat.scrollHeight;
}


// STUDY CALCULATOR

document.getElementById("calculatorForm")?.addEventListener(
    "submit", function(event) {

        event.preventDefault();

        let m1 = Number(document.getElementById("mark1").value);
        let m2 = Number(document.getElementById("mark2").value);
        let m3 = Number(document.getElementById("mark3").value);
        let max = Number(document.getElementById("maxMarks").value);

        if (max <= 0 || m1 < 0 || m2 < 0 || m3 < 0 ||
            m1 > max || m2 > max || m3 > max) {

            alert("Please enter valid marks!");
            return;
        }

        let total = m1 + m2 + m3;
        let maximum = max * 3;
        let average = total / 3;
        let percentage = (total / maximum) * 100;

        let grade;

        if (percentage >= 90) {
            grade = "A+";
        }
        else if (percentage >= 80) {
            grade = "A";
        }
        else if (percentage >= 70) {
            grade = "B";
        }
        else if (percentage >= 60) {
            grade = "C";
        }
        else if (percentage >= 50) {
            grade = "D";
        }
        else {
            grade = "Needs Improvement";
        }

        document.getElementById("calculatorResult").innerHTML =
            "<h2>Your Results</h2>" +
            "Total Marks: " + total + " / " + maximum + "<br>" +
            "Average Marks: " + average.toFixed(2) + "<br>" +
            "Percentage: " + percentage.toFixed(2) + "%<br>" +
            "Grade: " + grade;
    }
);




/* COMMON DARK MODE FOR ALL PAGES */

document.addEventListener("DOMContentLoaded", function () {

    const themeButton = document.getElementById("themeToggle");

    // Apply saved theme
    const savedTheme = localStorage.getItem("theme") || "light";

    document.body.classList.toggle(
        "dark-mode",
        savedTheme === "dark"
    );

    // Update button text
    function updateThemeButton() {
        if (themeButton) {
            themeButton.textContent =
                document.body.classList.contains("dark-mode")
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";
        }
    }

    updateThemeButton();

    // Change theme when button is clicked
    if (themeButton) {
        themeButton.addEventListener("click", function () {

            document.body.classList.toggle("dark-mode");

            const currentTheme =
                document.body.classList.contains("dark-mode")
                ? "dark"
                : "light";

            localStorage.setItem("theme", currentTheme);

            updateThemeButton();
        });
    }

});


/* =================================
   STUDYMATE - MILO JAVASCRIPT
================================= */

// DARK MODE

const themeButton = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeButton.innerHTML = "☀️";
}

// Change theme
themeButton.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        themeButton.innerHTML = "☀️";

        localStorage.setItem("theme", "dark");

    } else {

        themeButton.innerHTML = "🌙";

        localStorage.setItem("theme", "light");

    }

});


// ================= DARK / LIGHT MODE =================

document.addEventListener("DOMContentLoaded", function () {

    const themeToggle = document.getElementById("themeToggle");

    // Check whether the button exists
    if (!themeToggle) {
        console.error("Theme toggle button not found!");
        return;
    }

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("dark-mode");
        themeToggle.textContent = "🌙";
    }

    // Switch between dark and light mode
    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "☀️";
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙";
        }

    });

});
