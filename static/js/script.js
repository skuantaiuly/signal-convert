let currentFormId = 'form1';

function toggleForm() {
  const form1 = document.getElementById('form1');
  const form2 = document.getElementById('form2');
  const form3 = document.getElementById('form3');

  // Toggle visibility based on the current form being displayed
  if (currentFormId === 'form1') {
    form1.style.display = 'none';
    form2.style.display = 'block';
    form3.style.display = 'none';
    currentFormId = 'form2';
  } else if (currentFormId === 'form2') {
    form1.style.display = 'none';
    form2.style.display = 'none';
    form3.style.display = 'block';
    currentFormId = 'form3';
  } else {
    form1.style.display = 'block';
    form2.style.display = 'none';
    form3.style.display = 'none';
    currentFormId = 'form1';
  }
}

function displayFileName(input) {
  const fileNameDisplay = document.getElementById("file-name-display");
  if (input.files && input.files[0]) {
      fileNameDisplay.innerText = input.files[0].name;
  } else {
      fileNameDisplay.innerText = "No file chosen";
  }
}

function convertParameters(api_url) {
  const position = parseInt(document.getElementById('position').value, 10);
  const machine = document.getElementById('machine').value;
  const job = document.getElementById('job').value;
  const failure = document.getElementById('failure').value;
  const remote_mode = document.getElementById('remote_mode').value;
  const manual_start = document.getElementById('manual_start').value;
  const running = document.getElementById('running').value;
  const running_seconds = document.getElementById('running_seconds').value;
  const number_of_starts = document.getElementById('number_of_starts').value;

  const data = {
    position,
    machine,
    job,
    failure,
    remote_mode,
    manual_start,
    running,
    running_seconds,
    number_of_starts
  };
  const param_names = ['Автомат', 'Работа', 'Авария', 'Дист. Режим', 'Ручной пуск', 'Включение', 'Наработка сек', 'Кол-во пусков']

  fetch(`${api_url}/api/convert-signals/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const tbody = document.querySelector('.converted-data table tbody');
    tbody.innerHTML = '';
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>Позиция</td>
        <td>${data.position}</td>
        <td>-</td>
        <td>-</td>
    `;
    tbody.appendChild(row);
    data.values.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${param_names[index]}</td>
        <td>${item.signal}</td>
        <td>${item.result.hex}</td>
        <td>${item.result.dec}</td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(error => {
    console.error('Error:', error);
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerText = 'An error occurred while converting data. Please try again.' + error;
  });
}

function convertParam(api_url) {
  const signal_param = document.getElementById('signal').value;
  fetch(`${api_url}/api/convert-signal/`+ signal_param, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then (data => {
    const tbody = document.querySelector('.converted-data table tbody');
    tbody.innerHTML = '';

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>-</td>
        <td>${data.param}</td>
        <td>${data.values.hex}</td>
        <td>${data.values.dec}</td>
    `;
    tbody.appendChild(row);
  })
}

function convertFile(api_url) {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  if (!file) {
    console.error('No file selected.');
    return;
  }

  const formData = new FormData();
  formData.append('xlsx_file', file, file.name);

  fetch(`${api_url}/api/convert-signals/by-xlsx`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.blob();
  })
  .then(blob => {
    const convertedFileUrl = URL.createObjectURL(blob);
    window.open(convertedFileUrl);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}