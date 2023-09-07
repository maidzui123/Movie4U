// Function add movie theatre
let btnAddTheatre = document.getElementById('btn_add-theatre')
let btnEditTheatre = document.getElementById('btn_edit-theatre')
let btnDelTheatre = document.getElementById('btn_delete-theatre')
let checkboxTheatres = document.getElementsByName('checkboxTheatres')
let listTheatres = document.getElementById('list_theatres')

const addTheatresName = document.getElementById('theatre_name')
const addTheatresAddress = document.getElementById('theatre_address')
const addTheatresImg = document.getElementById('theatre_img')
const addTheatresBtn = document.getElementById('form_add-theatres')
const addTheatresTel = document.getElementById('theatre_tel')
const addTheatresDes = document.getElementById('theatre_description')
const addRoom2D3D = document.getElementById('2d3d_add')
const addRoomIMAX = document.getElementById('imax_add')
const addRoom4DX = document.getElementById('4dx_add')

const editTheatresLabel = document.getElementById('theatres_edit-label')
const editTheatresName = document.getElementById('theatre_name-edit')
const editTheatresAddress = document.getElementById('theatre_address-edit')
const editTheatresImg = document.getElementById('theatre_img-edit')
const editTheatresBtn = document.getElementById('form_edit-theatres')
const editTheatresTel = document.getElementById('theatre_tel-edit')
const editTheatresDes = document.getElementById('theatre_description-edit')
const editRoom2D3D = document.getElementById('2d3d_edit')
const editRoomIMAX = document.getElementById('imax_edit')
const editRoom4DX = document.getElementById('4dx_edit')

function validateTheatreTel(theatreTel) {
  var regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return regex.test(theatreTel)
}
// Add Theatre
addTheatresBtn.addEventListener('submit', function (event) {
  event.preventDefault();
  var formData = new FormData()

  formData.append('name', addTheatresName.value);
  formData.append('address', addTheatresAddress.value);
  formData.append('image', addTheatresImg.files[0]);
  formData.append('description', addTheatresDes.value);
  formData.append('R2D_3D', addRoom2D3D.value);
  formData.append('RIMAX', addRoomIMAX.value);
  formData.append('R4DX', addRoom4DX.value);
  if (validateTheatreTel(addTheatresTel.value)) {
    formData.append('tel', addTheatresTel.value);
    axios.post('/admin/addTheatre', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => {
      if (res.data.code == 200) {
        snackbar('success', '<b>Success: </b>  Add Theatre Success', 3000);
        getAllMovieTheatres()
      }
      else {
        snackbar('error', `<b>Error: </b> ${res.data.message}`, 3000);
      }
    }).catch(error => {
      snackbar('error', '<b>Error: </b>  Add Theatre Fail', 3000);
      console.error(error);
    });
  }
  else {
    snackbar('error', `<b>Error: </b> Wrong Tel Input`, 3000);
  }
})
// Edit Theatre
editTheatresBtn.addEventListener('submit', function (event) {
  event.preventDefault();
  var formData = new FormData()
  formData.append('id', editTheatresLabel.getAttribute('theatre_id'));
  formData.append('name', editTheatresName.value);
  formData.append('address', editTheatresAddress.value);
  formData.append('description', editTheatresDes.value);
  if (editTheatresImg.value === '') {
    console.log('File is empty')
  }
  else {
    formData.append('image', editTheatresImg.files[0]);
  }
  if (validateTheatreTel(editTheatresTel.value)) {
    formData.append('tel', editTheatresTel.value)
    axios.post('/admin/updateTheatre', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => {
      console.log(res)
      if (res.data.code == 200) {
        snackbar('success', '<b>Success: </b>  Edit Theatre Success', 3000);
        getAllMovieTheatres()
      }
      else {
        snackbar('error', `<b>Error: </b> ${res.data.message}`, 3000);
      }
    }).catch(error => {
      snackbar('error', '<b>Error: </b>  Edit Theatre Fail', 3000);
      console.error(error);
    });
  }
  else {
    snackbar('error', `<b>Error: </b> Wrong Tel Input`, 3000);
  }
})

function getAllMovieTheatres() {
  axios.get('/admin/getAllTheatres', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(res => {
      renderMovieTheatres(res.data.data)
    })
    .catch(err => {
      console.error(err)
    })
}

getAllMovieTheatres()
function renderMovieTheatres(data) {
  listTheatres.innerHTML = ''
  data.forEach(element => {
    listTheatres.insertAdjacentHTML('beforeend', `
    <tr>
    <td scope="row">${element.id}</td>
    <td>${element.name}</td>
    <td><img class="theatres_img" src="${element.image}" alt=""></td>
    <td>${element.address}</td>
    <td><label class="content_checkbox-outer"><input type="checkbox" class="content_checkbox"
                name="theatre_checkbox" value="${element.id}"><span class="checkmark"></span></label></td>
    <td><button id="btn_open-edit" type="button" class="btn btn-outline-warning" data-bs-toggle="modal"
            data-bs-target="#theatres_edit-modal" onclick="selectTheatreToEdit(${element.id})">Edit</button></td>
    </tr>
    `)
  });
}

function selectTheatreToEdit(id) {
  axios.get('/admin/getTheatreById?theatre_id=' + id, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(res => {
      const data = res.data.data[0]
      editTheatresLabel.innerHTML = "Edit Theatre Id: " + data.theatre_id
      editTheatresLabel.setAttribute('theatre_id', data.theatre_id)
      editTheatresName.value = data.theatre_name
      editTheatresAddress.value = data.theatre_address
      editTheatresTel.value = data.tel
      editTheatresDes.value = data.description
      editRoom2D3D.value = data.R2D_3D
      editRoomIMAX.value = data.R4DX
      editRoom4DX.value = data.RIMAX
      console.log(res.data.data[0])
    })
    .catch(err => {
      console.error(err)
    })
}
const listTheatreCheckbox = document.getElementsByName('theatre_checkbox');

// DELETE
function getDeleteTheatreCheckboxSelected() {
  const listTheatreCheckboxSelected = []
  for (let i = 0; i < listTheatreCheckbox.length; i++) {
    if (listTheatreCheckbox[i].checked) {
      listTheatreCheckboxSelected.push(deleteTheatreSelected(listTheatreCheckbox[i].value));
    }
  }
  return listTheatreCheckboxSelected
}
function deleteTheatreSelected(id) {
  axios.delete('/admin/deleteTheatre?id=' + id, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
}
btnDelTheatre.addEventListener('click', () => {
  if (getDeleteTheatreCheckboxSelected().length == 0) {
    snackbar('error', '<b>Error: </b>  Nothing To Delete', 3000);
  }
  else {
    Promise.all(getDeleteTheatreCheckboxSelected())
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        snackbar('error', '<b>Error: </b>  Delete Theatre Fail', 3000);
        console.error(err)
      })
    window.location.reload()

  }
})
