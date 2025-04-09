import { v4 as uuidv4 } from 'uuid';
document.getElementById("editSchoolName").value = sessionStorage.getItem("editSchoolName");
document.getElementById("editSchoolType").value = sessionStorage.getItem("editSchoolType");
document.getElementById("editSchoolLocation").value = sessionStorage.getItem("editSchoolLocation");

document.getElementById("editForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let oldName = sessionStorage.getItem("editSchoolName");
    let updatedName = document.getElementById("editSchoolName").value;
    let updatedType = document.getElementById("editSchoolType").value;
    let updatedLocation = document.getElementById("editSchoolLocation").value;

    let schools = JSON.parse(localStorage.getItem("schools")) || [];
    let index = schools.findIndex(s => s.sch_name === oldName);
    if (index !== -1) {
        // if(!('unique_id' in schools[index])){
        //     schools[index].unique_id = uuidv4().substring(0,7);
        // }
        schools[index].sch_name = updatedName;
        schools[index].school_type = updatedType;
        schools[index].location = updatedLocation;

    }
    localStorage.setItem("schools", JSON.stringify(schools));

    window.location.href = "index.html";
});