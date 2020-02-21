window.addEventListener("DOMContentLoaded", start);

let students = [];
const studentlist = "https://petlatkea.dk/2020/hogwarts/students.json";
const template = document.querySelector("template");
const list = document.querySelector("#list");

const Student = {
  firstname: "",
  lastname: "",
  middlename: "",
  nickname: "",
  gender: "",
  image: "",
  house: ""
};

function start() {
  getData();
  hidePopup();
}

// async function getData() {
//   let jsonData = await fetch(studentlist);
//   studentsData = await jsonData.json();
//   console.log(jsonData);

//   prepareData(studentsData);
// }

function getData() {
  fetch(studentlist)
    .then(response => response.json())
    .then(jsonData => {
      prepareData(jsonData);
    });
}

function prepareData(jsonData) {
  console.log("Prepare");

  jsonData.forEach(jsonObject => {
    const student = Object.create(Student);

    //TODO: clean names. split and capitalize
    const fullnameString = jsonObject.fullname.trim().toLowerCase();
    const fullnameArray = fullnameString.split(" ");

    let first = fullnameArray[0];
    let last = fullnameArray[fullnameArray.length - 1];

    let firstName = first[0].toUpperCase() + first.substring(1);
    let lastName = last[0].toUpperCase() + last.substring(1);

    console.log(firstName, lastName);

    if (fullnameArray.length > 2) {
      let middle = fullnameArray[1];
      let middleName = middle[0].toUpperCase() + middle.substring(1);

      student.middlename = middleName;

      if (middle[0] == `"` || "`") {
        student.middlename = "";
        let nickName = middle[1].toUpperCase() + middle.substring(2, middle.length - 1);

        student.nickname = nickName;
      }
    } else {
      student.middlename = "";
    }

    //TODO: clean house
    let house = jsonObject.house.trim().toLowerCase();
    let studentHouse = house[0].toUpperCase() + house.substring(1);

    //TODO: clean gender
    let gender = jsonObject.gender.trim().toLowerCase();
    let studentGender = gender[0].toUpperCase() + gender.substring(1);

    //TODO: find nicknames

    student.firstname = firstName;
    student.lastname = lastName;
    // student.middlename = jsonObject.fullname;
    //student.nickname = jsonObject.fullname;
    student.gender = studentGender;
    student.image = jsonObject.fullname;
    student.house = studentHouse;

    students.push(student);
  });

  showList();
}

function showList() {
  console.log("show list");
  list.innerHTML = "";

  students.forEach(showJson);
}

function showJson(student) {
  console.log("show json");
  const clone = template.cloneNode(true).content;

  clone.querySelector("#name").textContent = student.firstname + " " + student.middlename;
  clone.querySelector("#house").textContent = student.house + " " + student.nickname;

  clone.querySelector(".student").addEventListener("click", () => {
    showPopup(student);
  });

  list.appendChild(clone);
}

function hidePopup() {
  document.querySelector("#popup").style.display = "none";
  document.querySelector("#student_popup").classList = "";
}

function showPopup(student) {
  document.querySelector("#popup").style.display = "block";

  document.querySelector("#popup .close").addEventListener("click", hidePopup);

  document.querySelector("#popup_name").textContent = student.firstname;
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
