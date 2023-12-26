(async () => {
  let studentsList = [];

  //запрос текущего списка с сервера
  async function refreshStudentList() {
    const response = await fetch(`http://localhost:3000/api/students`);
    studentsList = await response.json();
    return studentsList;
  }

  const handlers = {
    onChange({ studentElement }) {
      renderModalForm(studentElement);
    },
    onDelete({ studentObj, element }) {
      if (!confirm('Вы уверены?')) {
        return;
      };
      element.remove();
      fetch(`http://localhost:3000/api/students/${studentObj.id}`, {
        method: 'DELETE',
      });
    },
  }

  const currentDate = new Date();
  const toLocalFormat = new Intl.DateTimeFormat("ru");
  const currentDateLocal = toLocalFormat.format(currentDate);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const STUDY_PERIOD = 4;
  const entryAge = 16;

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

  function getStudentAge(birthdayObj) {
    let birthday = new Date(birthdayObj);
    birthday.setHours(0);
    let studentsAge = currentYear - birthday.getFullYear();
    let month = currentDate.getMonth() - birthday.getMonth();
    if (month < 0 || (month === 0 && currentDate.getDate() < birthday.getDate())) {
      studentsAge -= 1;
    }
    let localFormatbirthday = toLocalFormat.format(birthday);
    return {
      studentsAge,
      localFormatbirthday,
    }
  }

  //*создание строки в таблице по одному студенту
  function getStudentItem(studentObj, { onChange, onDelete }) {
    const tableRow = document.createElement('tr');
    const rowNumber = document.createElement('th');
    const cellFullName = document.createElement('td');
    const cellFaculty = document.createElement('td');
    const cellAge = document.createElement('td');
    const cellStudyPeriod = document.createElement('td');
    const cellbuttonDelete = document.createElement('td');
    const cellbuttonChange = document.createElement('td');

    tableRow.classList.add('table-row');
    rowNumber.setAttribute('scope', 'row');
    studentsTable.append(tableRow);

    rowNumber.textContent = studentObj.id;
    cellFullName.textContent = `${studentObj.surname} ${studentObj.name} ${studentObj.lastname}`;
    cellFaculty.textContent = studentObj.faculty;

    //считаем текущий возраст
    let localFormatbirthday = getStudentAge(studentObj.birthday).localFormatbirthday;
    let studentsAge = getStudentAge(studentObj.birthday).studentsAge;
    cellAge.textContent = `${localFormatbirthday} (${studentsAge} ${ageWord(studentsAge)})`;

    //считаем годы обучения
    let studyStart = studentObj.studyStart;
    let endEducationYear = Number(studyStart) + STUDY_PERIOD;
    let studyCourse = currentYear - studyStart;

    if (currentMonth > 8) {
      cellStudyPeriod.textContent = `${studyStart}-${endEducationYear} (${studyCourse += 1} курс)`;
    }
    if (currentYear < endEducationYear && currentMonth < 8) {
      cellStudyPeriod.textContent = `${studyStart}-${endEducationYear} (${studyCourse} курс)`;
    }
    if (currentYear == studyStart) {
      studyCourse = 1;
    }
    if (currentYear > endEducationYear || (currentYear === endEducationYear && currentMonth >= 8)) {
      cellStudyPeriod.textContent = `${studyStart}-${endEducationYear} (закончил)`;
    }

    let btnDelete = document.createElement('button');
    btnDelete.classList.add('btn', 'btn-danger', 'ms-auto', 'btn-sm');
    btnDelete.textContent = 'Удалить';
    let btnChange = document.createElement('button');
    btnChange.classList.add('btn', 'btn-warning', 'me-auto', 'btn-sm');
    btnChange.textContent = 'Изменить';
    cellbuttonDelete.append(btnDelete);
    cellbuttonChange.append(btnChange);

    tableRow.append(rowNumber, cellFullName, cellFaculty, cellAge, cellStudyPeriod, cellbuttonChange, cellbuttonDelete);

    //слухачи на кнопки
    btnDelete.addEventListener('click', () => {
      onDelete({ studentObj, element: tableRow });
      refreshStudentList();
    });

    btnChange.addEventListener('click', async (e) => {
      modal.showModal();
      isModalOpen = true;
      e.stopPropagation();
      const response = await fetch(`http://localhost:3000/api/students/${studentObj.id}`);
      studentElement = await response.json();
      onChange({ studentElement });
    });
  }

  //*создание функции отрисовки всех студентов
  //очистка
  function clearTable() {
    if (!studentsTable) {
      return;
    }
    studentsTable.replaceChildren();
  }

  //*рендер
  function renderStudentsTable(studentsArray) {
    clearTable();
    studentsArray = renderFilteredArray(sortingArray(studentsArray));
    studentsArray.forEach(element => {
      getStudentItem(element, handlers);
    });
  }

  //форма добавления студента
  const formAdding = document.querySelector('#creation-form');
  const studyStartInput = document.querySelector('#input-startEducationYear');

  //значение input
  function getInputValue(inputElement) {
    const value = inputElement.value;
    return value;
  };

  //*функции валидации input
  function validateText(text) {
    let checkedText = false;
    const regexp = /[^а-яА-ЯёЁ\s]/gi;
    if (text.length > 0 && !regexp.test(text)) checkedText = text;
    return checkedText;
  };

  function textToUpperCase(text) {
    checkedText = '';
    if (text.length > 0)
      checkedText = text[0].toUpperCase() + text.slice(1).toLowerCase();
    return checkedText;
  }

  function textToLowerCase(text) {
    text = text.toLowerCase();
    return text;
  }

  function validateDate(dateElement) {
    let date = getInputValue(dateElement);
    const birthday = new Date(date);
    birthday.setHours(0, 0, 0, 0);
    const startDate = new Date('1900-01-01');

    console.log('dateElement', dateElement);
    let findStudyStartElement = ((dateElement.parentNode).parentNode).querySelector('[name="Год начала обучения"]');
    console.log('findStudyStartElement', findStudyStartElement);

    let studyStartValue = new Date(`${getInputValue(findStudyStartElement)}-08-01`);
    studyStartValue.setHours(0, 0, 0, 0);

    let studentEntryAge = studyStartValue.getFullYear() - birthday.getFullYear();
    let month = studyStartValue.getMonth() - birthday.getMonth();
    if (month < 0 || (month === 0 && studyStartValue.getDate() < birthday.getDate())) {
      studentEntryAge -= 1;
    }

    console.log(`studentEntryAge, ${studentEntryAge},
     studyStartValue, ${studyStartValue},
     birthday.getFullYear(), ${birthday.getFullYear()},`);

    let checkedDate = false;
    if (startDate.getTime() <= birthday.getTime() && birthday.getTime() < currentDate.getTime() && studentEntryAge >= entryAge) {
      checkedDate = date;
    };
    return checkedDate;
  };

  function validateYear(year) {
    const startYear = 2000;
    let checkedYear = false;
    if (startYear <= year && year <= currentYear) {
      checkedYear = year;
    };
    return checkedYear;
  };

  function validateEndYear(year) {
    const startYear = 2000;
    let checkedYear = false;
    if (startYear <= year && year <= (currentYear + STUDY_PERIOD)) {
      checkedYear = year;
    };
    return checkedYear;
  };

  //валидация
  function validateInput(inputElement) {
    const inputValue = getInputValue(inputElement).trim();
    let checkedInput;
    let alertText = '';

    switch (inputElement.type) {
      case 'text':
        checkedInput = validateText(textToUpperCase(inputValue));
        alertText = `Поле ${inputElement.name} не заполнено или заполнено не на русском`;
        console.log('checkedInput', checkedInput);
        break;
      case 'date':
        checkedInput = validateDate(inputElement);
        alertText = `Введите дату от 01.01.1900 до ${currentDateLocal}, проверьте возраст поступающего`;
        console.log('checkedInput', checkedInput);
        break;
      case 'number':
        checkedInput = validateYear(inputValue);
        alertText = `Введите дату от 2000г. до ${currentYear}г.`;
        console.log('checkedInput', checkedInput);
        break;
    }

    if (!checkedInput) {
      let alertInput = document.createElement('p');
      inputElement.classList.add('input-invalid');
      alertInput.classList.add('input-alert');
      alertInput.textContent = alertText;
      inputElement.parentNode.append(alertInput);
    }
    return checkedInput;
  }

  //очистка ошибок валидации
  function cleanInputErrors(form) {
    let formInputs = form.querySelectorAll('input');
    formInputs.forEach((inputElement) => {
      inputElement.classList.remove('input-invalid');
    })
    let formtext = form.querySelectorAll('p');
    formtext.forEach((p) => {
      p.remove();
    })
  }

  //отправка данных на сервер
  async function createStudent(valuesArray) {
    const response = await fetch('http://localhost:3000/api/students', {
      method: 'POST',
      body: JSON.stringify({
        name: valuesArray[0],
        surname: valuesArray[1],
        lastname: valuesArray[2],
        birthday: valuesArray[3],
        studyStart: valuesArray[4],
        faculty: valuesArray[5],
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const newStudent = await response.json();
    console.log('sending newStudent to server', newStudent);
    return newStudent;
  }

  const addingFormInputs = Array.from(formAdding.querySelectorAll('input'));

  formAdding.addEventListener('submit', async function (e) {
    e.preventDefault();
    cleanInputErrors(formAdding);
    //проверка на ошибки/отрисовка
    addingFormInputs.forEach((inputElement) => {
      validateInput(inputElement);
    })

    if (!(formAdding.querySelectorAll('p')).length) {
      const newStudent = addingFormInputs.map(inputElement => {
        return validateInput(inputElement);
      });
      console.log('newStudent', newStudent);
      const newStudentObj = await createStudent(newStudent);
      getStudentItem(newStudentObj, handlers);
      await refreshStudentList();
      renderStudentsTable(studentsList);
      formAdding.reset();
    }
  });

  //*сортировка
  const tableStudents = document.querySelector('#tableTR');
  let dir;
  let keys = [];

  function sortingArray(array) {
    tableStudents.onclick = async function (e) {
      let sortByElement = e.target;
      let target = sortByElement.id;
      switch (target) {
        case 'Fullname':
          keys = ['lastname', 'name', 'surname'];
          break;
        case 'Faculty':
          keys = ['faculty'];
          break;
        case 'DateAge':
          keys = ['birthday'];
          break;
        case 'StudyYears':
          keys = ['studyStart'];
          break;
      }
      dir = sortByElement.dataset.dir === 'true' ? true : false;
      sortByElement.dataset.dir = !dir;
      studentsList = await refreshStudentList();
      renderStudentsTable(studentsList);
    }
    return sortArrayElement(array, dir, keys)
  }

  //сортировка по полю
  function sortArrayElement(array, dir, keys) {
    let sortedArray = [...array];
    if (keys != undefined) {
      for (const key of keys) {
        sortedArray = sortedArray.sort(function (a, b) {
          let sortDirection = dir ? (a[key] > b[key]) : (a[key] < b[key]);
          if (sortDirection) return -1;
          if (!sortDirection) return 1;
          return 0;
        }
        )
      }
    }
    return sortedArray;
  }

  // фильтрация
  const filterForm = document.querySelector('#filter-form');
  const inputFilterFullName = document.querySelector('#input-filterFullName');
  const inputFilterFaculty = document.querySelector('#input-filterFaculty');
  const inputFilterStartEducationYear = document.querySelector('#input-filterStartEducationYear');
  const inputFilterEndEducationYear = document.querySelector('#input-filterEndEducationYear');
  const buttonDeclineFilter = document.querySelector('#declineFilterBtn');
  const buttonDeclineSort = document.querySelector('#declineSortBtn');


  filterForm.addEventListener('input', async function () {
    studentsList = await refreshStudentList();
    renderStudentsTable(studentsList);
  });

  function renderFilteredArray(arr) {
    let checkedFullName = getInputValue(inputFilterFullName).trim().split(' ');

    checkedFullName.forEach((text, i) => {
      checkedFullName[i] = validateText(textToLowerCase(text));
    });

    let checkedFaculty = validateText(textToLowerCase(getInputValue(inputFilterFaculty).trim()));
    let checkedStartEducationYear = validateYear(getInputValue(inputFilterStartEducationYear));
    let checkedEndEducationYear = validateEndYear(getInputValue(inputFilterEndEducationYear));

    let copyStudentsArray = [...arr];

    copyStudentsArray.forEach((student) => {
      student.fio = `${textToLowerCase(student.surname)} ${textToLowerCase(student.name)} ${textToLowerCase(student.lastname)}`;
      student.facultyForFilter = textToLowerCase(student.faculty);
    })

    if (!checkedFullName.includes(false)) {
      copyStudentsArray = copyStudentsArray.filter(function (student) {
        let checkIncludes = 0;
        checkedFullName.forEach((text) => {
          if (student.fio.includes(text)) checkIncludes += 1;
        })
        return checkIncludes === checkedFullName.length;
      });
    }
    if (checkedFaculty) {
      copyStudentsArray = copyStudentsArray.filter(function (student) {
        return student.facultyForFilter.includes(checkedFaculty);
      });
    }
    if (checkedStartEducationYear) {
      copyStudentsArray = copyStudentsArray.filter(function (student) {
        return student.studyStart.includes(checkedStartEducationYear);
      });
    }
    if (checkedEndEducationYear) {
      copyStudentsArray = copyStudentsArray.filter(function (student) {
        const studyStart = checkedEndEducationYear - 4;
        return student.studyStart.includes(studyStart);
      });
    }
    return copyStudentsArray;
  }

  buttonDeclineFilter.addEventListener('click', async function (e) {
    e.preventDefault();
    filterForm.reset();
    studentsList = await refreshStudentList();
    renderStudentsTable(studentsList);
  });

  buttonDeclineSort.addEventListener('click', async function (e) {
    e.preventDefault();
    keys.length = 0;
    dir = null;
    studentsList = await refreshStudentList();
    renderStudentsTable(studentsList);
  });


  //*модальное окно
  let isModalOpen = false;
  const modal = document.querySelector('dialog');
  const modalBox = document.querySelector('#modal-box'); //*
  const closeModalBtn = document.querySelector('#close-modal-btn');//*
  const saveModalBtn = document.querySelector('#save-modal-btn');//*

  const modalBody = document.querySelector('#modal-body');

  closeModalBtn.addEventListener('click', () => {
    modal.close()
    isModalOpen = false
  })

  document.addEventListener('click', (e) => {
    if (isModalOpen && !modalBox.contains(e.target)) {
      modal.close()
    }
  })

  //* создание содержимого модального окна (вывести текущее содержимое obj + сохранить)
  //div для инпута
  function createDiv(inputElement) {
    let div = document.createElement('div');
    div.append(inputElement);
    modalBody.append(div);
  }
  //рендер модального окна //?перенести в html
  function renderModalForm(obj) {
    modalBody.replaceChildren();
    console.log('выбранный obj.id', obj.id);
    let nameInput = document.createElement('input');
    let surnameInput = document.createElement('input');
    let lastnameInput = document.createElement('input');
    let birthdayInput = document.createElement('input');
    let studyStartInput = document.createElement('input');
    let facultyInput = document.createElement('input');

    nameInput.setAttribute('type', 'text');
    surnameInput.setAttribute('type', 'text');
    lastnameInput.setAttribute('type', 'text');
    birthdayInput.setAttribute('type', 'date');
    studyStartInput.setAttribute('type', 'number');
    studyStartInput.setAttribute('step', '1');
    studyStartInput.name = 'Год начала обучения';

    facultyInput.setAttribute('type', 'text');

    nameInput.value = obj.name;
    surnameInput.value = obj.surname;
    lastnameInput.value = obj.lastname;
    birthdayInput.value = obj.birthday;
    studyStartInput.value = obj.studyStart;
    facultyInput.value = obj.faculty;

    modalBody.append(nameInput, surnameInput, lastnameInput, birthdayInput, studyStartInput, facultyInput);

    let modalFormInputs = Array.from(modalBody.querySelectorAll('input'));

    modalFormInputs.forEach((input) => {
      input.classList.add('form-control', 'form__input', 'mb-2');
      createDiv(input);
    })

    modalBody.addEventListener('submit', async (e) => {
      console.log('submit');
      e.preventDefault();
      cleanInputErrors(modalBody);

      const changedStudentInputs = {
        name: validateInput(nameInput),
        surname: validateInput(surnameInput),
        lastname: validateInput(lastnameInput),
        birthday: validateInput(birthdayInput),
        studyStart: validateInput(studyStartInput),
        faculty: validateInput(facultyInput),
      };

      if (!(modalBody.querySelectorAll('p')).length) {
        const response = await fetch(`http://localhost:3000/api/students/${obj.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: changedStudentInputs.name,
            surname: changedStudentInputs.surname,
            lastname: changedStudentInputs.lastname,
            birthday: changedStudentInputs.birthday,
            studyStart: changedStudentInputs.studyStart,
            faculty: changedStudentInputs.faculty,
          }),
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const sentResponse = await response.json();

        studentsList = await refreshStudentList();
        renderStudentsTable(studentsList);
        modal.close();
        isModalOpen = false;
      };
    })
  }
  //*
  studentsList = await refreshStudentList();
  renderStudentsTable(studentsList);
})()
