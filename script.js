window.addEventListener("DOMContentLoaded", start);

let students = [];
const studentlist = "students1991.json";
const template = document.querySelector("template");
const list = document.querySelector("#list");

function start() {
  getData();
  hidePopup();
}

async function getData() {
  let jsonData = await fetch(studentlist);
  students = await jsonData.json();
  console.log(jsonData);

  showJson();
}

function showJson() {
  students.forEach(student => {
    const clone = template.cloneNode(true).content;

    clone.querySelector("#name").textContent = student.fullname;
    clone.querySelector("#house").textContent = student.house;

    clone.querySelector(".student").addEventListener("click", () => {
      showPopup(student);
    });

    list.appendChild(clone);
  });
}

function hidePopup() {
  document.querySelector("#popup").style.display = "none";
  document.querySelector("#student_popup").classList = "";
}

function showPopup(student) {
  document.querySelector("#popup").style.display = "block";

  document.querySelector("#popup .close").addEventListener("click", hidePopup);

  document.querySelector("#popup_name").textContent = student.fullname;
  document.querySelector("#popup_house").textContent = student.house;

  document.querySelector("#popup").dataset.house = student.house;
  const studentHouse = document.querySelector("#popup").dataset.house;

  if (studentHouse == "Gryffindor") {
    document.querySelector("#student_popup").classList.add("gryffindor");
  } else if (studentHouse == "Hufflepuff") {
    document.querySelector("#student_popup").classList.add("hufflepuff");
  } else if (studentHouse == "Slytherin") {
    document.querySelector("#student_popup").classList.add("slytherin");
  } else if (studentHouse == "Ravenclaw") {
    document.querySelector("#student_popup").classList.add("ravenclaw");
  }

  document.querySelector("select#theme").addEventListener("change", selected);
}

function selected() {
  console.log(this.value);
  let choice = this.value;

  document.querySelector("#student_popup").classList = "";
  document.querySelector("#student_popup").classList.add(choice);
}
