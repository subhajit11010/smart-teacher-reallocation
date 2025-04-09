import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';

// Initialize the map
let map = L.map('map').setView([22.5726, 88.3639], 6); // Default view (West Bengal)

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add a draggable marker
let marker = L.marker([22.5726, 88.3639], { draggable: true }).addTo(map);

// Update location input when marker moves
marker.on('dragend', function (event) {
    let position = marker.getLatLng();
    document.getElementById('schoolLocation').value = 'Lat: ' + position.lat + ", " + 'Long: ' + position.lng;
});

document.getElementById('schoolSearch').addEventListener('keypress', function (event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Prevents form submission
        searchSchool();
    }
});

function searchSchool() {
    let query = document.getElementById('schoolSearch').value.trim();

    if (query === "") {
        alert("Please enter a school name.");
        return;
    }

    // Fetch the key from backend
    fetch('http://127.0.0.1:5000/get-opencage-key')
        .then(response => response.json())
        .then(data => {
            let apiKey = data.key;

            // Now call the OpenCage API
            fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.results.length > 0) {
                        let location = data.results[0].geometry;
                        map.setView([location.lat, location.lng], 14);
                        marker.setLatLng([location.lat, location.lng]);

                        // Update input field with latitude & longitude
                        document.getElementById('schoolLocation').value = 'Lat: ' + location.lat + ", " + 'Long: ' + location.lng;
                    } else {
                        alert("School not found!");
                    }
                })
                .catch(error => {
                    console.error("Error fetching location:", error);
                    alert("Error finding school. Please try again.");
                });
        })
        .catch(error => {
            console.error("Error fetching API key:", error);
        });
}


let ptr_standards = {
    'Primary': 26,
    'Upper Primary': 19,
    'Secondary': 17,
    'Higher Secondary': 27
}


let currentStep = 1;
const totalSteps = 13;

document.querySelector(".next").addEventListener("click", function () {
    let active_classes = document.getElementsByClassName("active");
    Array.from(active_classes).forEach(cls => {
        if (cls && cls.id.includes("step")) {
            let step = cls.id.split("-")[1];
            nextStep(parseInt(step));
            // console.log(parseInt(step), currentStep)
        }
    });
});

document.querySelector(".prev").addEventListener("click", function () {
    prevStep();
});

let teacher_categories_to_be_showed = []
function show_teacher_category() {
    document.querySelectorAll('div.sch_teac_cat').forEach(catNode => {
        catNode.style.display = "none";
    });
    document.querySelectorAll('div.sch_enroll_students').forEach(enrollNode => {
        enrollNode.style.display = "none";
    });
    teacher_categories_to_be_showed.forEach(category => {
        if (category == "Primary") {
            let catNodelist = document.querySelectorAll('div.pr');
            catNodelist.forEach(catNode => {
                catNode.style.display = "block";
            });
        }
        if (category == "Upper Primary") {
            let catNodelist = document.querySelectorAll('div.upr');
            catNodelist.forEach(catNode => {
                catNode.style.display = "block";
            });
        }
        if (category == "Secondary") {
            let catNodelist = document.querySelectorAll('div.sec');
            catNodelist.forEach(catNode => {
                catNode.style.display = "block";
            });
        }
        if (category == "Higher Secondary") {
            let catNodelist = document.querySelectorAll('div.hsec');
            catNodelist.forEach(catNode => {
                catNode.style.display = "block";
            });
        }
    });
}

function calc_total_students() {
    let ts_node_val = 0;
    document.querySelectorAll('div.sch_enroll_students[style="display: block;"] input.sch_enroll').forEach(elem => {
        let value = parseInt(elem.value.trim());
        if (!isNaN(value)) {
            ts_node_val += value;
        }
    });
    document.getElementById("total_students").value = ts_node_val;
}



function process_standard_ptr() {
    let standard_PTR = [];
    let sum = 0;
    teacher_categories_to_be_showed.forEach(cat => {
        if (cat in ptr_standards) {
            standard_PTR.push(ptr_standards[cat]);
        }
    });
    let len = standard_PTR.length;
    for (var i = 0; i < len; i++) {
        sum += standard_PTR[i];
    }
    sum = (sum / len).toFixed(6);
    return sum;
}

function nextStep(step) {
    if (step == 7) {
        teacher_categories_to_be_showed = [];
        const checkbox_containers = document.querySelectorAll(".school-category-con")
        let checkbox_selected = 0;
        checkbox_containers.forEach(cc => {
            let cb = cc.querySelector('input[type="checkbox"]');
            if (cb.checked) {
                teacher_categories_to_be_showed.push(cb.value);
                checkbox_selected++;
            }
        });
        if (checkbox_selected == 0) {
            alert("You have to choose any one of the categories!!!");
            return;
        }
        else {
            document.querySelector('input[id="standard_PTR"]').value = process_standard_ptr();
            show_teacher_category();
        }
    }
    else if (step == 11) {
        let not_filled = false;
        let sum = 0;
        document.querySelectorAll('div.sch_enroll_students[style="display: block;"] input.sch_enroll').forEach(elem => {
            if (elem.value.trim() === "") {
                not_filled = true;
            }
            else {
                sum += elem.value;
            }
        });

        if (not_filled || sum == 0) {
            alert("Please Enter the exact number of students (Total number of students can't be zero)!!!");
            return;
        }
        else {
            calc_total_students();
        }
    }
    else if (step == 12) {
        let total_students = parseFloat(document.getElementById("total_students").value.trim());
        let total_teachers = parseFloat(document.getElementById("male").value.trim()) + parseFloat(document.getElementById("female").value.trim());

        if (total_teachers === 0) {
            alert("Total number of teachers cannot be zero.");
            return;
        }
        let ptr = total_students / total_teachers;
        document.getElementById("actual_PTR").value = ptr.toFixed(2);
    }

    const input = document.querySelector(`#step-${step} input`);
    // if (input && input.value.trim() !== "") {  // Ensure input exists & is filled
    document.getElementById(`step-${step}`).classList.remove("active");

    currentStep++;
    if (currentStep <= totalSteps) {
        document.getElementById(`step-${currentStep}`).classList.add("active");
    } else {
        currentStep = totalSteps;
        document.getElementById(`step-${currentStep}`).classList.add("active");
        document.getElementById("submitBtn").style.display = "block";
        // }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove("active");
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add("active");
    }
}

function formatCategories(categories) {
    if (categories.length === 0) {
        return "";
    }

    if (categories.length === 1) {
        return categories[0];
    }

    if (categories.length === 2) {
        return categories.join(" & ");
    }

    // Join all elements except the last one with commas
    const firstPart = categories.slice(0, -1).join(", ");
    // Add the last element with " & "
    const lastPart = categories[categories.length - 1];

    return `${firstPart} & ${lastPart}`;
}

document.addEventListener("DOMContentLoaded", function () {
    loadSchools(); // Load stored schools on page load
});

let school_arr = [];
document.getElementById("schoolForm").addEventListener("submit", function (event) {
    event.preventDefault();

    console.log(formatCategories(teacher_categories_to_be_showed));
    let unique_id = uuidv4().substring(0, 7);
    console.log(unique_id);
    let sch_name = document.getElementById("schoolName").value;
    let school_type = document.getElementById("schoolType").value;
    let location = document.getElementById("schoolLocation").value;
    let male = Number(document.getElementById("male").value);
    let female = Number(document.getElementById("female").value);
    let regular = Number(document.getElementById("regular").value);
    let contract = Number(document.getElementById("contract").value);
    let part_time = Number(document.getElementById("part_time").value);
    let total_teacher_trained_computer = Number(document.getElementById("total_teacher_trained_computer").value);
    let school_category = formatCategories(teacher_categories_to_be_showed);
    let class_taught_pr = (document.getElementById("sch_teac_pr").value.trim() === "") ? 0 : Number(document.getElementById("sch_teac_pr").value);
    let class_taught_upr = (document.getElementById("sch_teac_upr").value.trim() === "") ? 0 : Number(document.getElementById("sch_teac_upr").value);
    let class_taught_pr_upr = (document.getElementById("sch_teac_pr_upr").value.trim() === "") ? 0 : Number(document.getElementById("sch_teac_pr_upr").value);
    let class_taught_sec = (document.getElementById("sch_teac_sec").value.trim() === "") ? 0 : Number(document.getElementById("sch_teac_sec").value);
    let class_taught_hsec = (document.getElementById("sch_teac_hsec").value.trim() === "") ? 0 : Number(document.getElementById("sch_teac_hsec").value);
    let class_taught_upr_sec = (document.getElementById("sch_teac_upr_sec").value.trim() === "") ? 0 : Number(document.getElementById("sch_teac_upr_sec").value);
    let class_taught_sec_hsec = (document.getElementById("sch_teac_sec_hsec").value.trim() === "") ? 0 : Number(document.getElementById("sch_teac_sec_hsec").value);
    let teacher_involve_non_training_assignment = Number(document.getElementById("teacher_involve_non_training_assignment").value);
    let standard_PTR = parseFloat(document.getElementById("standard_PTR").value);
    let sch_enroll_primary = (document.getElementById("sch_enroll_pr").value.trim() === "") ? 0 : Number(document.getElementById("sch_enroll_pr").value);
    let sch_enroll_upper_primary = (document.getElementById("sch_enroll_upr").value.trim() === "") ? 0 : Number(document.getElementById("sch_enroll_upr").value);
    let sch_enroll_secondary = (document.getElementById("sch_enroll_sec").value.trim() === "") ? 0 : Number(document.getElementById("sch_enroll_sec").value);
    let sch_enroll_higher_secondary = (document.getElementById("sch_enroll_hsec").value.trim() === "") ? 0 : Number(document.getElementById("sch_enroll_hsec").value);
    let total_students = Number(document.getElementById("total_students").value);
    let total_teacher = parseFloat(document.getElementById("male").value.trim()) + parseFloat(document.getElementById("female").value.trim());
    let actual_PTR = parseFloat(document.getElementById("actual_PTR").value);

    // document.querySelectorAll(".sch_enroll_students").forEach(elem => {
    //     const input = elem.getElementsByTagName("input")[0];
    //     if (input) {
    //         if (input.value.trim() === "") {
    //             console.log("Input is blank.");
    //         } else {
    //             console.log("Input value:", input.value);
    //         }
    //     } else {
    //         console.log("No input element found in this sch_teac_cat element.");
    //     }
    // });

    let schools = JSON.parse(localStorage.getItem("schools")) || [];

    // Check if the school already exists BEFORE adding
    let index = schools.findIndex(s => s.sch_name === sch_name);

    if (index !== -1) {
        alert(`The school "${sch_name}" already exists.`);
        return; // Stop execution
    }

    // If school doesn't exist, add it
    schools.push({ unique_id, sch_name, school_type, location, male, female, regular, contract, part_time, total_teacher_trained_computer, school_category, class_taught_pr, class_taught_upr, class_taught_pr_upr, class_taught_sec, class_taught_hsec, class_taught_upr_sec, class_taught_sec_hsec, teacher_involve_non_training_assignment, standard_PTR, sch_enroll_primary, sch_enroll_upper_primary, sch_enroll_secondary, sch_enroll_higher_secondary, total_students, total_teacher, actual_PTR });

    localStorage.setItem("schools", JSON.stringify(schools));

    addSchoolToTable(sch_name, school_type, location);

    // Reset form after adding
    document.getElementById("schoolForm").reset();
    window.location.reload();
});

function deleteRow(button) {
    let row = button.parentElement.parentElement;
    let name = row.cells[0].innerText;
    let schools = JSON.parse(localStorage.getItem("schools")) || [];
    schools = schools.filter(school => school.sch_name !== name);
    localStorage.setItem("schools", JSON.stringify(schools));
    row.remove();
}

function addTeacher(sch_name) {
    window.location.href = "add_teacher.html?sch_name=" + sch_name;
}

function addSchoolToTable(name, school_type, location) {
    let table = document.getElementById("schoolTable").getElementsByTagName("tbody")[0];
    let newRow = table.insertRow();

    let schools = JSON.parse(localStorage.getItem("schools")) || [];
    let school = schools.find(s => s.sch_name === name);
    let teachersExist = school && school.teachers && school.teachers.length > 0;

    newRow.innerHTML = `
        <td>${name}</td>
        <td>${school_type}</td>
        <td>${location}</td>
        <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
            <button class="teacher-btn">${teachersExist ? 'See Teacher Info' : 'Add Teacher'}</button>
        </td>`;

    const editBtn = newRow.querySelector(".edit-btn");
    const deleteBtn = newRow.querySelector(".delete-btn");
    const teacherBtn = newRow.querySelector(".teacher-btn");

    editBtn.onclick = function () { editSchool(this); };
    deleteBtn.onclick = function () { deleteRow(this); };
    teacherBtn.onclick = function () {
        if (teachersExist) {
            window.location.href = "add_teacher.html?sch_name=" + name; // Shows existing info
        } else {
            addTeacher(name); // Goes to form
        }
    };
}


function loadSchools() {
    let schools = JSON.parse(localStorage.getItem("schools")) || [];
    let table = document.getElementById("schoolTable").getElementsByTagName("tbody")[0];

    schools.forEach(school => {
        addSchoolToTable(school.sch_name, school.school_type, school.location);
    });
}


function editSchool(button) {
    let row = button.parentElement.parentElement;
    let name = row.cells[0].innerText;
    let school_type = row.cells[1].innerText;
    let location = row.cells[2].innerText;

    sessionStorage.setItem("editSchoolName", name);
    sessionStorage.setItem("editSchoolType", school_type);
    sessionStorage.setItem("editSchoolLocation", location);

    window.location.href = "edit.html";
}

document.getElementById("top-right-div").addEventListener("click", function () {
    let schools = JSON.parse(localStorage.getItem("schools")) || [];
    fetch("http://127.0.0.1:5000/allocate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ schools }),
    })
        .then(response => response.json())
        .then(data => {

            localStorage.setItem("suggestions", JSON.stringify(data));
            reallocate_teachers();
        })
        .catch(error => console.error("Error:", error));
});


function reallocate_teachers() {
    window.location.href = "reallocate.html";
}