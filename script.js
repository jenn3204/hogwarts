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
  house: "",
  prefect: false,
  squad: false
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

  //search
  document.querySelector("#search").addEventListener("input", search);
  // document.querySelector("#search_bar button").addEventListener("click", search);
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

    student.prefect = Student.prefect;
    student.squad = Student.squad;

    students.push(student);
    console.log(student.firstname, student.middlename, student.nickname, student.lastname);
  });

  showList(students);
}

function buildList() {
  const currentList = filterStudents(settings.filter);

  document.querySelector("#displayed_amount").textContent = "Displayed: " + currentList.length;

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

  //prefects and inquisitorial squad

  if (student.prefect == false) {
    clone.querySelector("#make_prefect").textContent = "Make prefect!";
  } else if (student.prefect == true) {
    clone.querySelector("#make_prefect").textContent = "I am a prefect!";
  }

  clone.querySelector("#make_prefect").addEventListener("click", function() {
    togglePrefects(student);
  });

  if (student.squad == false) {
    clone.querySelector("#squad_button").textContent = "Add to inquisitorial squad";
  } else if (student.squad == true) {
    clone.querySelector("#squad_button").textContent = "I am on the squad!";
  }

  clone.querySelector("#squad_button").addEventListener("click", function() {
    toggleSquad(student);
  });

  // show popup when click on student img
  clone.querySelector("#list_img").addEventListener("click", () => {
    showPopup(student);
  });

  list.appendChild(clone);

  listDetails(student);
}

function listDetails() {
  document.querySelector("#total_amount").textContent = "Total: " + students.length;

  document.querySelector("#grif_amount").textContent = "Gryffindor: ";
}

function hidePopup() {
  document.querySelector("#popup").style.display = "none";
  document.querySelector("#student_popup").classList = "";

  // hide alert popup
  document.querySelector("#alert_popup").classList.add("hide");
  document.querySelector("#notsamegender").classList = "";
  document.querySelector("#squad_info").classList = "";
  document.querySelector("#onlytwo").classList = "";
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

  //themes
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

function search() {
  const chosenSearch = event.target.value;
  console.log(chosenSearch);

  document.querySelector("#search_bar button").addEventListener("click", function() {
    searchFor(chosenSearch);
  });
}

function searchFor(chosenSearch) {
  console.log("jeg er her");

  const result = students.filter(searchFunction);

  function searchFunction(student) {
    if (chosenSearch == student.firstname || chosenSearch == student.lastname) {
      return true;
    } else {
      return false;
    }
  }

  showList(result);
}

// prefects and inquisitorial squad

function togglePrefects(student) {
  const prefects = students.filter(student => student.prefect);
  console.log(prefects);

  const prefectsOfSameHouse = prefects.filter(prefect => prefect.house === student.house);
  console.log(prefectsOfSameHouse);

  const prefectGender = prefects.some(prefect => {
    return prefect.gender === student.gender && prefect.house === student.house;
  });

  if (student.prefect == true) {
    student.prefect = false;
  } else if (student.prefect == false) {
    if (prefectsOfSameHouse.length > 1) {
      student.prefect = false;
      showPrefectAlert();
    } else if (prefectGender) {
      student.prefect = false;
      showPrefectGenderAlert();
    } else {
      student.prefect = true;
    }
  }

  console.log(student.prefect);
  buildList(students);
}

function toggleSquad(student) {
  const squadMembers = students.filter(student => student.squad);
  console.log(squadMembers);

  if (student.squad == true) {
    student.squad = false;
  } else if (student.squad == false) {
    if (student.house == "Slytherin") {
      student.squad = true;
    } else {
      student.squad = false;
      showSquadAlert();
    }
  }

  buildList(students);
}

function showPrefectAlert() {
  document.querySelector("#alert_popup").classList.toggle("hide");
  document.querySelector("#notsamegender").classList.add("hide");
  document.querySelector("#squad_info").classList.add("hide");

  document.querySelector("#close_info").addEventListener("click", hidePopup);
}

function showPrefectGenderAlert() {
  document.querySelector("#alert_popup").classList.remove("hide");
  document.querySelector("#squad_info").classList.add("hide");

  document.querySelector("#close_info").addEventListener("click", hidePopup);
}

function showSquadAlert() {
  document.querySelector("#alert_popup").classList.remove("hide");
  document.querySelector("#notsamegender").classList.add("hide");
  document.querySelector("#onlytwo").classList.add("hide");

  document.querySelector("#close_info").addEventListener("click", hidePopup);
}
