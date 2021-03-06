"use strict";

window.addEventListener("DOMContentLoaded", start);

let students = [];
let expelledStudents = [];
let pureblood = [];
let halfblood = [];

const studentlist = "https://petlatkea.dk/2020/hogwarts/students.json";
const familiesList = "https://petlatkea.dk/2020/hogwarts/families.json";

const template = document.querySelector("template");
const list = document.querySelector("#list");

let systemIsHacked = false;

const Student = {
  firstname: "",
  lastname: "",
  middlename: "",
  nickname: "",
  gender: "",
  image: "",
  house: "",
  prefect: false,
  squad: false,
  bloodstatus: "",
  expelled: false
};

const settings = {
  filter: "*",
  sorting: "*",
  direction: "asc"
};

function start() {
  // calling the familylist data first, to make sure all the data from both json files are finished at the same time
  getData(familiesList, prepareBloodstatus);
  hidePopup();

  // filtering and sorting
  document.querySelector("select#filtering").addEventListener("change", filter);
  document.querySelector("select#sorting").addEventListener("change", sort);

  //search
  document.querySelector("#search").addEventListener("input", search);

  // hacking
  document.querySelector("#hack_button").addEventListener("click", systemHacked);
}

function getData(url, callback) {
  fetch(url)
    .then(response => response.json())
    .then(jsonData => {
      callback(jsonData);
    });
}

function prepareBloodstatus(familiesJson) {
  // the json data is put in to two arrays, one with the halfblood families and one pureblood
  pureblood = familiesJson.pure;
  halfblood = familiesJson.half;

  getData(studentlist, prepareData);
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
    } else if (lastName.indexOf("-") > -1) {
      let hyphen = lastName.indexOf("-");
      let Hyphen = lastName.substring(hyphen + 1);
      let image = "images/" + Hyphen + "_" + firstName[0].toLowerCase() + ".png";
      student.image = image;
    } else {
      let image = "images/" + lastName.toLowerCase() + "_" + firstName[0].toLowerCase() + ".png";
      student.image = image;
    }

    student.prefect = Student.prefect;
    student.squad = Student.squad;

    //blood status

    // if the students last name is in both lists/arrays, they are halfblood (because im a nice person)
    if (pureblood.indexOf(student.lastname) > -1 && halfblood.indexOf(student.lastname) > -1) {
      student.bloodstatus = "Pureblood";
      // if the students lastname is only in the array of pureblood family names, they will be pureblooded
    } else if (pureblood.indexOf(student.lastname) > -1) {
      student.bloodstatus = "Pureblood";
      // if the students lastname is only in the array of halfblood family names, they will be halfblooded
    } else if (halfblood.indexOf(student.lastname) > -1) {
      student.bloodstatus = "Halfblood";
      // if the students lastname is not in any of the arrays, it means they are muggleborn
    } else {
      student.bloodstatus = "Muggleborn";
    }

    students.push(student);
  });

  showList(students);
  listDetails(students);
}

function buildList() {
  // the list gets filteret by whatever filter is chosen og current list is declared
  const currentList = filterStudents(settings.filter);
  console.log("setiings: " + settings.filter);

  showList(currentList);
  listDetails(currentList);
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
  clone.querySelector("#list_img").alt = "Student Portrait";
  clone.querySelector("#house").textContent = student.house;

  //prefects badges

  if (student.prefect == false) {
    clone.querySelector("#make_prefect").style.filter = "grayscale(100)";
  } else if (student.prefect == true) {
    clone.querySelector("#make_prefect").style.filter = "none";
  }

  clone.querySelector("#make_prefect").addEventListener("click", function() {
    togglePrefects(student);
  });

  // the inquisitorial squad member badge is only shown on relevant students

  if (student.squad == false) {
    clone.querySelector("#squad_button").style.filter = "grayscale(100)";
  } else if (student.squad == true) {
    clone.querySelector("#squad_button").style.filter = "none";
  }

  if (student.house == "Slytherin" || student.bloodstatus == "Pureblood") {
    clone.querySelector("#squad_button").classList.remove("hide");
    clone.querySelector("#squad_button").addEventListener("click", function() {
      toggleSquad(student);
    });
  }

  // expelling
  clone.querySelector("#expel_button").addEventListener("click", function() {
    expelStudent(student);
  });

  // styling of expelled list
  if (student.expelled === true) {
    console.log(student);
    clone.querySelector("#student").style.filter = "grayscale(100)";
    clone.querySelector("#make_prefect").style.display = "none";
    clone.querySelector("#squad_button").style.display = "none";
    clone.querySelector("#expel_button").style.display = "none";
  }

  // if system is hacked, make students bloodstatus untrustworthy
  if (systemIsHacked) {
    const bloodStatusArray = ["Muggleborn", "Halfblood", "Pureblood"];

    // if the students lastname is on both lists, the student will now (after hacking) be given a random bloodstatus
    if (pureblood.indexOf(student.lastname) > -1 && halfblood.indexOf(student.lastname) > -1) {
      let randomStatus = Math.floor(Math.random() * bloodStatusArray.length);
      student.bloodstatus = bloodStatusArray[randomStatus];
      // if the student is pureblooded, they will be given a random bloodstatus
    } else if (pureblood.indexOf(student.lastname) > -1) {
      let randomStatus = Math.floor(Math.random() * bloodStatusArray.length);
      student.bloodstatus = bloodStatusArray[randomStatus];
      // if the student is halfblood og muggleborn, they will now be listed as pureblood
    } else if (halfblood.indexOf(student.lastname) > -1) {
      student.bloodstatus = "Pureblood";
    } else {
      student.bloodstatus = "Pureblood";
    }
  }

  // show popup when click on student img
  clone.querySelector("#list_info").addEventListener("click", () => {
    showPopup(student);
  });

  list.appendChild(clone);

  listDetails(student);
}

function listDetails(current) {
  document.querySelector("#total_amount").textContent = "Total: " + students.length;
  document.querySelector("#displayed_amount").textContent = "Displayed: " + current.length;
  document.querySelector("#expelled_amount").textContent = "Expelled students: " + expelledStudents.length;

  document.querySelector("#grif_amount").textContent = "Gryffindor: " + students.filter(student => student.house == "Gryffindor").length;
  document.querySelector("#huffle_amount").textContent = "Hufflepuff: " + students.filter(student => student.house == "Hufflepuff").length;
  document.querySelector("#slyth_amount").textContent = "Slytherin: " + students.filter(student => student.house == "Slytherin").length;
  document.querySelector("#raven_amount").textContent = "Ravenclaw: " + students.filter(student => student.house == "Ravenclaw").length;
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
  document.querySelector("#popup_img").alt = "Student Portrait";
  document.querySelector("#popup_nick").textContent = "Nickname: " + student.nickname;
  document.querySelector("#popup_house").textContent = "House: " + student.house;
  document.querySelector("#popup_gender").textContent = "Gender: " + student.gender;
  document.querySelector("#popup_bloodstatus").textContent = "Bloodstatus: " + student.bloodstatus;

  if (student.prefect == true) {
    document.querySelector("#make_prefect2").classList.remove("hide");
  } else {
    document.querySelector("#make_prefect2").classList.add("hide");
  }

  if (student.squad == true) {
    document.querySelector("#squad_button2").classList.remove("hide");
  } else {
    document.querySelector("#squad_button2").classList.add("hide");
  }

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

  if (chosenFilter == "expelled") {
    showExpelled(expelledStudents);
    document.querySelector("#displayed_amount").textContent = "Displayed: " + expelledStudents.length;
  } else {
    buildList();
  }
}

function filterStudents(chosenFilter) {
  const result = students.filter(filterFunction);

  function filterFunction(student) {
    if (chosenFilter == student.house || chosenFilter == "*") {
      return true;
    } else if (chosenFilter == "prefect" && student.prefect == true) {
      return true;
    } else if (chosenFilter == "squad" && student.squad == true) {
      return true;
    } else {
      return false;
    }
  }

  return result;
}

//sorting

function sort() {
  console.log(this);
  const chosenSorting = this.value;

  console.log("sort" + chosenSorting);

  settings.sorting = chosenSorting;

  sortFunction(chosenSorting);
}

function sortFunction(chosenSorting) {
  const sorting = students.sort(compareFunction);

  function compareFunction(a, b) {
    console.log("compare");
    if (chosenSorting == "prefect" || chosenSorting == "squad") {
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

  buildList();
}

//searching
function search() {
  const chosenSearch = event.target.value;
  console.log(chosenSearch);

  document.querySelector("#search").addEventListener("keyup", function(e) {
    if (e.keyCode === 13) {
      searchFor(chosenSearch);
    }
  });

  document.querySelector("#search_bar button").addEventListener("click", function() {
    searchFor(chosenSearch);
  });
}

function searchFor(chosenSearch) {
  console.log("jeg er her");

  const result = students.filter(searchFunction);

  function searchFunction(student) {
    const studentName = student.firstname.toLowerCase() + student.middlename.toLowerCase() + student.lastname.toLowerCase();

    if (studentName.indexOf(chosenSearch) > -1) {
      return true;
    } else {
      return false;
    }
  }

  showList(result);
  listDetails(result);
}

// expelling
function expelStudent(student) {
  //finding the index of this specific student in the array of students
  const studentIndex = students.indexOf(student);
  console.log(studentIndex);

  // if the user is trying to expel me, it will not be possible and a warning will pop up
  if (student.firstname == "Jennifer") {
    showExpelAlert();
  } else {
    //from the array of students, cut out the 1 object with the index of the chosen student
    students.splice(studentIndex, 1);
    // the student is then placed in another array, the array of expelled students
    expelledStudents.push(student);
    student.expelled = true;
  }

  buildList(students);
}

function showExpelled() {
  console.log("show expelled");
  list.innerHTML = "";

  expelledStudents.forEach(showJson);
}

// prefects and inquisitorial squad

function togglePrefects(student) {
  // prefect = the students with "prefect = true"
  const prefects = students.filter(student => student.prefect);
  console.log(prefects);

  // prefectsOfSameHouse = finding the students with "prefect = true" that are also from the same house
  const prefectsOfSameHouse = prefects.filter(prefect => prefect.house === student.house);
  console.log(prefectsOfSameHouse);

  // finding the prefects that are both from the same house and also the same gender
  const prefectGender = prefects.some(prefect => {
    return prefect.gender === student.gender && prefect.house === student.house;
  });

  if (student.prefect == true) {
    // if the student is already a prefect, revoke them from being so, when you push the button/badge
    student.prefect = false;
  } else if (student.prefect == false) {
    // if the student is not already a prefect, but there are already two students from the house who are prefects, its not possible and show a warning
    if (prefectsOfSameHouse.length > 1) {
      student.prefect = false;
      showPrefectAlert();
      // if the student is the same gender and house as someone who is already a prefect, it will not be possible and warning will pop up
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
    if (student.house == "Slytherin" || student.bloodstatus == "Pureblood") {
      student.squad = true;
    } else {
      student.squad = false;
      showSquadAlert();
    }
  }

  buildList(students);

  // if the system is hacked and a students added to the squad, will be removed after 3 sek
  if (systemIsHacked) {
    if (student.house == "Slytherin" || student.bloodstatus == "Pureblood") {
      setTimeout(function() {
        toggleSquad(student);
      }, 3000);
    }
  }
}

function showPrefectAlert() {
  document.querySelector("#alert_popup").classList.toggle("hide");
  document.querySelector("#notsamegender").classList.add("hide");
  document.querySelector("#squad_info").classList.add("hide");
  document.querySelector("#noexpel").classList.add("hide");

  document.querySelector("#close_info").addEventListener("click", hidePopup);
}

function showPrefectGenderAlert() {
  document.querySelector("#alert_popup").classList.remove("hide");
  document.querySelector("#squad_info").classList.add("hide");
  document.querySelector("#noexpel").classList.add("hide");

  document.querySelector("#close_info").addEventListener("click", hidePopup);
}

function showSquadAlert() {
  document.querySelector("#alert_popup").classList.remove("hide");
  document.querySelector("#notsamegender").classList.add("hide");
  document.querySelector("#onlytwo").classList.add("hide");
  document.querySelector("#noexpel").classList.add("hide");

  document.querySelector("#close_info").addEventListener("click", hidePopup);
}

function showExpelAlert() {
  document.querySelector("#alert_popup").classList.remove("hide");
  document.querySelector("#notsamegender").classList.add("hide");
  document.querySelector("#onlytwo").classList.add("hide");
  document.querySelector("#squad_info").classList.add("hide");

  document.querySelector("#close_info").addEventListener("click", hidePopup);
}

function systemHacked() {
  // this functions hacks the system

  // the hacking events will only happen is the system is not already hacked
  if (systemIsHacked == false) {
    document.querySelector("body").style.backgroundImage = "url(img/hearts_background.svg";

    // creating Student object with my own information
    const myself = Object.create(Student);
    myself.firstname = "Jennifer";
    myself.middlename = "Strejby";
    myself.lastname = "Jaqué";
    myself.nickname = "Jenni";
    myself.gender = "Girl";
    myself.image = "images/jaque_j.jpg";
    myself.house = "Gryffindor";
    myself.prefect = false;
    myself.squad = false;
    myself.cannotBeExpelled = true;

    // pushing me, the object, to the list of students
    students.unshift(myself);

    showList(students);

    systemIsHacked = true;
  }
}
