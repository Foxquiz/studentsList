// Этап 1. В HTML файле создайте верстку элементов, которые будут статичны(неизменны).

// Этап 2. Создайте массив объектов студентов.Добавьте в него объекты студентов, например 5 студентов.

const studentsList = [
  {
    id: 1,
    name: 'Илья',
    surname: 'Гусев',
    patronymic: 'Анатольевич',
    birthDate: '2004-11-30',
    startEducationYear: 2020,
    faculty: 'Биологический'
  },
  {
    id: 2,
    name: 'Игнат',
    surname: 'Метко',
    patronymic: 'Сергеевич',
    birthDate: '2002-12-27',
    startEducationYear: 2020,
    faculty: 'Информатика и системы управления'
  },
  {
    id: 3,
    name: 'Дмитрий',
    surname: 'Жирко',
    patronymic: 'Александрович',
    birthDate: '1987-11-20',
    startEducationYear: 2005,
    faculty: 'Энергомашиностроение'
  },
  {
    id: 4,
    name: 'Виктор',
    surname: 'Баринов',
    patronymic: 'Семёнович',
    birthDate: '1997-02-10',
    startEducationYear: 2017,
    faculty: 'Робототехника и комплексная автоматизация'
  },
  {
    id: 5,
    name: 'Марк',
    surname: 'Тасманов',
    patronymic: 'Александрович',
    birthDate: '2002-04-11',
    startEducationYear: 2019,
    faculty: 'Машиностроительные технологии'
  }
]


// Этап 3. Создайте функцию вывода одного студента в таблицу, по аналогии с тем, как вы делали вывод одного дела в модуле 8. Функция должна вернуть html элемент с информацией и пользователе.У функции должен быть один аргумент - объект студента.
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const STUDY_PERIOD = 4;
let studentsTable = document.querySelector('#studentsTable');

//определяем 'лет'/'год'/'года' без учёта возраста меньше 10 и больше 100
function ageWord(age) {
  let stringAge = age.toString();
  let secondDigit = stringAge[1];

  let ageWord = '';

  switch (secondDigit) {
    case '1':
      ageWord = 'год'
      break
    case '2' || '3' || '4':
      ageWord = 'года'
      break
    default:
      ageWord = 'лет'
      break
  };

  return ageWord;
}

//создание строки в таблице по одному студенту
function getStudentItem(studentObj) {
  let tableRow = document.createElement('tr');
  let rowNumber = document.createElement('th');
  let cellFullName = document.createElement('td');
  let cellFaculty = document.createElement('td');
  let cellAge = document.createElement('td');
  let cellStudyPeriod = document.createElement('td');
  let fullName = '';

  tableRow.classList.add('table-row');
  rowNumber.setAttribute('scope', 'row');
  studentsTable.append(tableRow);

  rowNumber.textContent = studentObj.id;

  fullName = studentObj.surname + ' ' + studentObj.name + ' ' + studentObj.patronymic;
  cellFullName.textContent = fullName;

  cellFaculty.textContent = studentObj.faculty;

  //считаем текущий возраст
  //!нужно при расчёте принимать значение времени 00:00, а то др день в день считает некорректно

  let birthDate = new Date(studentObj.birthDate);
  let hoursBirthDate = birthDate.getHours() * (1000 * 60 * 60);
  let localFormatBirthDate = ('0' + birthDate.getDate()).slice(-2) + '.' + ('0' + (birthDate.getMonth() + 1)).slice(-2) + '.' + birthDate.getFullYear();
  let studentsAge = Math.floor((currentDate.getTime() - birthDate.getTime() - hoursBirthDate) / (365 * 24 * 60 * 60 * 1000));
  cellAge.textContent = localFormatBirthDate + ` (${studentsAge}` + ' ' + `${ageWord(studentsAge)})`;

  console.log('birthDate', birthDate);

  //считаем годы обучения
  let startEducationDate = studentObj.startEducationYear;
  let endEducationYear = startEducationDate + STUDY_PERIOD;
  let studyCourse = currentYear - startEducationDate;
  if (currentYear > endEducationYear || (currentYear === endEducationYear && currentMonth >= 8)) cellStudyPeriod.textContent = startEducationDate + `-` + endEducationYear + ' (закончил)';

  if (currentYear < endEducationYear || (currentYear === endEducationYear && currentMonth < 8))
    cellStudyPeriod.textContent = startEducationDate + `-` + endEducationYear + ` (${studyCourse} курс)`;

  tableRow.append(rowNumber, cellFullName, cellFaculty, cellAge, cellStudyPeriod);
}

// Этап 4. Создайте функцию отрисовки всех студентов. Аргументом функции будет массив студентов.Функция должна использовать ранее созданную функцию создания одной записи для студента.Цикл поможет вам создать список студентов.Каждый раз при изменении списка студента вы будете вызывать эту функцию для отрисовки таблицы.

function renderStudentsTable(studentsArray) {
  studentsArray.forEach(element => {
    getStudentItem(element)
  });
}

renderStudentsTable(studentsList);
// Этап 5. К форме добавления студента добавьте слушатель события отправки формы, в котором будет проверка введенных данных.Если проверка пройдет успешно, добавляйте объект с данными студентов в массив студентов и запустите функцию отрисовки таблицы студентов, созданную на этапе 4.
// const addingButton = document.querySelector('#addBtn');
const formAdding = document.querySelector('#creation-form');

const nameInput = document.querySelector('#input-name');
const surnameInput = document.querySelector('#input-surname');
const patronymicInput = document.querySelector('#input-patronymic');
const birthDateInput = document.querySelector('#input-birthDate');
const startEducationYearInput = document.querySelector('#input-startEducationYear');
const facultyInput = document.querySelector('#input-faculty');

const errorField = document.querySelector('#errorField');
//значение input
function getInputValue(inputElement) {
  const value = inputElement.value;
  return value;
};
//очистка инпута
function clearInputValue(inputElement) {
  inputElement.value = '';
}

//валидация
function validateName() {
  const nameValue = getInputValue(nameInput).trim();
  console.log('nameValue', nameValue);
  const checkedName = validateText(nameValue);
  console.log('checkedName', checkedName);

  if (!checkedName) {
    let alert = document.createElement('p');
    alert.classList.add('mark');
    alert.textContent = 'Поле "Имя студента" не заполнено или заполнено не на русском';
    errorField.append(alert);
  }

  if (checkedName) {
    const name = checkedName;
    return name;
  }
};

function validateSurname() {
  const surnameValue = getInputValue(surnameInput).trim();
  console.log('surnameValue', surnameValue);
  const checkedSurname = validateText(surnameValue);
  console.log('checkedSurname', checkedSurname);

  if (!checkedSurname) {
    let alert = document.createElement('p');
    alert.classList.add('mark');
    alert.textContent = 'Поле "Фамилия студента" не заполнено или заполнено не на русском';
    errorField.append(alert);
  }

  if (checkedSurname) {
    const surname = checkedSurname;
    return surname;
  }
};

function validatePatronymic() {
  const patronymicValue = getInputValue(patronymicInput).trim();
  console.log('surpatronymicValuename', patronymicValue);
  const checkedPatronymic = validateText(patronymicValue);
  console.log('checkedPatronymic', checkedPatronymic);

  if (!checkedPatronymic) {
    let alert = document.createElement('p');
    alert.classList.add('mark');
    alert.textContent = 'Поле "Отчество студента" не заполнено или заполнено не на русском';
    errorField.append(alert);
  }

  if (checkedPatronymic) {
    const patronymic = checkedPatronymic;
    return patronymic;
  }
};

function validateFaculty() {
  const facultyValue = getInputValue(facultyInput).trim();
  console.log('facultyValue', facultyValue);
  const checkedFaculty = validateText(facultyValue);
  console.log('checkedFaculty', checkedFaculty);

  if (!checkedFaculty) {
    let alert = document.createElement('p');
    alert.classList.add('mark');
    alert.textContent = 'Поле "Факультет" не заполнено или заполнено не на русском';
    errorField.append(alert);
  }

  if (checkedFaculty) {
    const faculty = checkedFaculty;
    return faculty;
  }
};

function validateBirthDate() {
  const birthDateValue = getInputValue(birthDateInput);;
  console.log('birthDateValue', birthDateValue);
  const checkedBirthDate = validateDate(birthDateValue);
  console.log('checkedBirthDate', checkedBirthDate);

  if (!checkedBirthDate) {
    let alert = document.createElement('p');
    alert.classList.add('mark');
    alert.textContent = 'Поле "Дата рождения" заполнено некорректно (менее 01.01.1900 или из будущего)';
    errorField.append(alert);
  }

  if (checkedBirthDate) {
    const birthDate = checkedBirthDate;
    return birthDate;
  }
};

function validateStartEducationYear() {
  const startEducationYearValue = parseInt(getInputValue(startEducationYearInput), 10);
  console.log('startEducationYearValue', startEducationYearValue);
  const checkedStartEducationYear = validateYear(startEducationYearValue);
  console.log('checkedStartEducationYear', checkedStartEducationYear);

  if (!checkedStartEducationYear) {
    let alert = document.createElement('p');
    alert.classList.add('mark');
    alert.textContent = 'Поле "Год начала обучения" заполнено некорректно (менее 2000 или из будущего)';
    errorField.append(alert);
  }

  if (checkedStartEducationYear) {
    const startEducationYear = checkedStartEducationYear;

    return startEducationYear;
  }
};

//функции валидации input
function validateText(text) {
  let checkedText = false;
  const regexp = /[а-яА-ЯёЁ]/i;
  if (text.length > 0 && regexp.test(text)) {
    checkedText = text[0].toUpperCase() + text.slice(1).toLowerCase();
  };
  return checkedText;
};

function validateDate(date) {
  const birthDate = new Date(date);
  const startDate = new Date('1900-01-01');
  let checkedDate = false;
  if (startDate.getTime() <= birthDate.getTime() && birthDate.getTime() < currentDate.getTime()) {
    checkedDate = date;
  };
  return checkedDate;
};

function validateYear(year) {
  const startYear = 2000;
  let checkedYear = false;
  if (startYear <= year && year < currentYear) {
    checkedYear = year;
  };
  return checkedYear;
};

//очистка поля с ошибками
function cleanErrorField() {
  if (!errorField) {
    return;
  }
  errorField.replaceChildren();
};
//создание объекта
function createStudent(name, surname, patronymic, faculty, birthDate, startEducationDate) {
  const newStudent = {
    id: newId(studentsList),
    name: name,
    surname: surname,
    patronymic: patronymic,
    birthDate: birthDate,
    startEducationYear: startEducationDate,
    faculty: faculty,
  }
  console.log('newStudent', newStudent);
  return newStudent;
};

function newId(arr) {
  let currentId = 1;
  for (const item of arr) {
    if (item.id > currentId) currentId = item.id;
  };
  return currentId += 1;
};

formAdding.addEventListener('submit', function (e) {
  e.preventDefault();
  cleanErrorField();
  validateName();
  validateSurname();
  validatePatronymic();
  validateBirthDate();
  validateStartEducationYear();
  validateFaculty();

  if (!errorField.children.length) {
    let newStudent = createStudent(validateName(), validateSurname(), validatePatronymic(), validateFaculty(), validateBirthDate(), validateStartEducationYear());
    getStudentItem(newStudent);
    studentsList.push(newStudent);

    clearInputValue(nameInput);
    clearInputValue(surnameInput);
    clearInputValue(patronymicInput);
    clearInputValue(birthDateInput);
    clearInputValue(startEducationYearInput);
    clearInputValue(facultyInput);
  }
});

// Этап 5. Создайте функцию сортировки массива студентов и добавьте события кликов на соответствующие колонки.



// Этап 6. Создайте функцию фильтрации массива студентов и добавьте события для элементов формы.
