// Add Combo
let btnAddCombo = document.getElementById('btn_add-combo')
let btnEditCombo = document.getElementById('btn_edit-combo')
let btnDelCombo = document.getElementById('btn_delete-combo')
let listCombo = document.getElementById('list_combo')

const addComboName = document.getElementById('combo_name')
const addComboImg = document.getElementById('combo_img')
const addComboDes = document.getElementById('combo_description')
const addPopcornAmount = document.getElementById('popcorn_amount')
const addDrinkAmount = document.getElementById('drink_amount')
const addComboPrice = document.getElementById('combo_price')
const addComboBtn = document.getElementById('form_add-combo')

const editComboLabel = document.getElementById('combo_edit-label')
const editComboName = document.getElementById('combo_name-edit')
const editComboImg = document.getElementById('combo_img-edit')
const editComboDes = document.getElementById('combo_description-edit')
const editPopcornAmount = document.getElementById('popcorn_amount-edit')
const editDrinkAmount = document.getElementById('drink_amount-edit')
const editComboPrice = document.getElementById('combo_price-edit')
const editComboBtn = document.getElementById('form_edit-combo')
// Add Combo
addComboBtn.addEventListener('submit', function (event) {
    event.preventDefault();
    var formData = new FormData()
    formData.append('name', addComboName.value);
    formData.append('description', addComboDes.value);
    formData.append('image', addComboImg.files[0]);
    formData.append('popcorn', addPopcornAmount.value);
    formData.append('drink', addDrinkAmount.value);
    formData.append('price', addComboPrice.value);
    axios.post('/admin/addFoodCombo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => {
        if (res.data.code == 200) {
            snackbar('success', '<b>Success: </b>  Add Combo Success', 3000);
            getAllCombo()
        }
        else {
            snackbar('error', `<b>Error: </b> ${res.data.message}`, 3000);
        }
    }).catch(error => {
        snackbar('error', '<b>Error: </b>  Add Combo Fail', 3000);
        console.error(error);
    });
})
// Edit Combo
editComboBtn.addEventListener('submit', function (event) {
    event.preventDefault();
    var formData = new FormData()
    formData.append('id', editComboLabel.getAttribute('combo_id'));
    formData.append('name', editComboName.value);
    formData.append('description', editComboDes.value);
    formData.append('image', editComboImg.files[0]);
    formData.append('popcorn', editPopcornAmount.value);
    formData.append('drink', editDrinkAmount.value);
    formData.append('price', editComboPrice.value);
    if (editComboImg.value === '') {
        console.log('File is empty')
    }
    else {
        formData.append('image', editComboImg.files[0]);
    }
    axios.post('/admin/updateFoodCombo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => {
        console.log(res)
        if (res.data.code == 200) {
            snackbar('success', '<b>Success: </b>  Edit Combo Success', 3000);
            getAllCombo()
        }
        else {
            snackbar('error', `<b>Error: </b> ${res.data.message}`, 3000);
        }
    }).catch(error => {
        snackbar('error', '<b>Error: </b>  Edit Combo Fail', 3000);
        console.error(error);
    });
})
function selectComboToEdit(id) {
    axios.get('/admin/getFoodComboById?id=' + id, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            const data = res.data.data[0]
            editComboLabel.innerHTML = "Edit Food & Drink Combo Id: " + data.id
            editComboLabel.setAttribute('combo_id', data.id)
            editComboName.value = data.name
            editComboDes.value = data.description
            editPopcornAmount.value = data.popcorn
            editDrinkAmount.value = data.drink
            editComboPrice.value = data.price
        })
        .catch(err => {
            console.error(err)
        })
}
// Delete Combo Selected
const listComboCheckbox = document.getElementsByName('combo_checkbox');

function getDeleteComboCheckboxSelected() {
    const listComboCheckboxSelected = []
    for (let i = 0; i < listComboCheckbox.length; i++) {
        if (listComboCheckbox[i].checked) {
            listComboCheckboxSelected.push(deleteComboSelected(listComboCheckbox[i].value));
        }
    }
    return listComboCheckboxSelected
}
function deleteComboSelected(id) {
    axios.delete('/admin/deleteFoodCombo?id=' + id, {
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
btnDelCombo.addEventListener('click', () => {
    if (getDeleteComboCheckboxSelected().length == 0) {
        snackbar('error', '<b>Error: </b>  Nothing To Delete', 3000);
    }
    else {
        Promise.all(getDeleteComboCheckboxSelected())
            .then(res => {
                snackbar('success', '<b>Success: </b>  Delete Combo Success', 3000);
            })
            .catch(err => {
                snackbar('error', `<b>Error: </b> ${res.data.message}`, 3000); 
                console.error(err)
            })
        window.location.reload()
    }
})

// Render All Combo
function getAllCombo() {
    console.log('hahaaha')
    axios.get('/ticket/getFoodCombo', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            renderAllCombo(res.data.data)
        })
        .catch(err => {
            console.error(err)
        })
}
function renderAllCombo(data) {
    console.log('hehehee')
    listCombo.innerHTML = ''
    data.forEach(element => {
        listCombo.insertAdjacentHTML('beforeend',
            `
        <tr>
        <th scope="row">${element.id}</th>
        <td>${element.name}</td>
        <td><img class="theatres_img" src="${element.image}" alt=""></td>
        <td>${element.price}$</td>
        <td><label class="content_checkbox-outer"><input type="checkbox" class="content_checkbox"
        name="combo_checkbox" value="${element.id}"><span class="checkmark"></span></label></td>
        <td><button type="button" class="btn btn-outline-warning" data-bs-toggle="modal"
                data-bs-target="#combo_edit-modal" onclick="selectComboToEdit(${element.id})">Edit</button></td>
            </tr>
        `)
    });
}
getAllCombo()



