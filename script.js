"use strict";

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

const settings = {
  filter: "*",
  sorting: "*",
  direction: "asc"
};

function start() {
  getData();
  hidePopup();

  // filtering and sorting
  document.querySelector("select#filtering").addEventListener("change", filter);
  document.querySelector("select#sorting").addEventListener("change", sort);
}

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

    //clean names, split and capitalize
    const fullnameString = jsonObject.fullname.trim().toLowerCase();
    const fullnameArray = fullnameString.split(" ");

    let first = fullnameArray[0];
    let last = fullnameArray[fullnameArray.length - 1];

    let firstName = first[0].toUpperCase() + first.substring(1);
    let lastName = last[0].toUpperCase() + last.substring(1);

    //first names
    student.firstname = firstName;

    console.log(firstName, lastName);

    //middlenames and nicknames

    if (fullnameArray.length > 2) {
      let middle = fullnameArray[1];
      let middleName = middle[0].toUpperCase() + middle.substring(1);

      student.middlename = middleName;

      if (middle.indexOf(`"`) > -1) {
        student.middlename = "";
        let nickName = middle[1].toUpperCase() + middle.substring(2, middle.length - 1);

        student.nickname = nickName;
      }
    } else {
      student.middlename = "";
      student.nickname = "";
    }

    // hyphens and last names

    if (lastName.indexOf("-") > -1) {
      let hyphen = lastName.indexOf("-");
      let Hyphen = lastName.substring(hyphen);
      let capHyphen = Hyphen[0] + Hyphen[1].toUpperCase() + Hyphen.substring(2);
      //let hypenName = lastName.substring(0, hyphen) +
      student.lastname = lastName.substring(0, hyphen) + capHyphen;
    } else {
      student.lastname = lastName;
    }

    //cleaning house
    let house = jsonObject.house.trim().toLowerCase();
    let studentHouse = house[0].toUpperCase() + house.substring(1);
    student.house = studentHouse;

    //cleaning gender
    let gender = jsonObject.gender.trim().toLowerCase();
    let studentGender = gender[0].toUpperCase() + gender.substring(1);
    student.gender = studentGender;

    //images

    if (lastName == "Patil") {
      let image = "images/" + lastName.toLowerCase() + "_" + firstName[0].toLowerCase() + firstName.substring(1) + ".png";
      student.image = image;
    } else {
      let image = "images/" + lastName.toLowerCase() + "_" + firstName[0].toLowerCase() + ".png";
      student.image = image;
    }

    students.push(student);
    console.log(student.firstname, student.middlename, student.nickname, student.lastname);
  });

  showList(students);
}

function buildList() {
  const currentList = filterStudents(settings.filter);

  showList(currentList);
}

function showList(students) {
  console.log("show list");
  list.innerHTML = "";

  students.forEach(showJson);
}

function showJson(student) {
  console.log("show json");
  const clone = template.cloneNode(true).content;

  clone.querySelector("#name").textContent = student.firstname + " " + student.middlename + " " + student.lastname;
  clone.querySelector("#list_img").src = student.image;
  clone.querySelector("#list_img").alt = "student";
  clone.querySelector("#house").textContent = student.house;

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

  document.querySelector("#popup_name").textContent = student.firstname + " " + student.middlename + " " + student.lastname;
  document.querySelector("#popup_img").src = student.image;
  document.querySelector("#popup_img").alt = "student";
  document.querySelector("#popup_nick").textContent = "Nickname: " + student.nickname;
  document.querySelector("#popup_house").textContent = "House: " + student.house;
  document.querySelector("#popup_gender").textContent = "Gender: " + student.gender;

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

//FILTERING

function filter() {
  const chosenFilter = this.value;
  settings.filter = chosenFilter;
  console.log(chosenFilter);

  buildList();
}

function filterStudents(chosenFilter) {
  const result = students.filter(filterFunction);

  function filterFunction(student) {
    if (chosenFilter == student.house || chosenFilter == "*") {
      return true;
    } else {
      return false;
    }
  }

  return result;
}

//sorting

function sort() {
  const chosenSorting = this.value;
  const direction = this.dataset.sortDirection;

  if (settings.sorting == chosenSorting) {
    toggleDirection(direction, chosenSorting);
  }

  settings.sorting = chosenSorting;

  sortFunction(direction, chosenSorting);
}

function toggleDirection(direction, chosenSorting) {
  console.log("toggle");
  if (direction === "asc") {
    document.querySelector(`[data-sort="${chosenSorting}"]`).setAttribute("data-sort-direction", "desc");
  } else {
    document.querySelector(`[data-sort="${chosenSorting}"]`).setAttribute("data-sort-direction", "asc");
  }
}

function sortFunction(direction, chosenSorting) {
  const sorting = students.sort(compareFunction);

  function compareFunction(a, b) {
    console.log("compare");
    if (direction == "asc") {
      console.log("Hvis nu");
      if (a[chosenSorting] > b[chosenSorting]) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a[chosenSorting] < b[chosenSorting]) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  buildList(sorting);
}
