// Add Movies
let btnAddMovies = document.getElementById('btn_add-movies')
let btnEditMovies = document.getElementById('btn_edit-movies')
let btnDelMovies = document.getElementById('btn_delete-movies')
let listMovies = document.getElementById('list_movies')

const addMoviesName = document.getElementById('movie_name')
const addMoviesPoster = document.getElementById('movie_img')
const addMoviesDes = document.getElementById('movie_description')
const addMoviesTrailer = document.getElementById('movie_trailer')
const addAgeRestrict = document.getElementById('age_restrict')
const addMoviesActors = document.getElementById('movie_actors')
const addMoviesDirectors = document.getElementById('movie_directors')
const addMoviesDuration = document.getElementById('movie_duration')
const addMoviesRelDate = document.getElementById('movie_rel_date')
const addMoviesCategory = document.getElementsByName('movie_category')
const addMoviesStatus = document.getElementsByName('movie_status')

const editMoviesLabel = document.getElementById('movie_edit-label')
const editMoviesName = document.getElementById('movie_name-edit')
const editMoviesPoster = document.getElementById('movie_img-edit')
const editMoviesDes = document.getElementById('movie_description-edit')
const editMoviesTrailer = document.getElementById('movie_trailer-edit')
const editAgeRestrict = document.getElementById('age_restrict-edit')
const editMoviesActors = document.getElementById('movie_actors-edit')
const editMoviesDirectors = document.getElementById('movie_directors-edit')
const editMoviesDuration = document.getElementById('movie_duration-edit')
const editMoviesRelDate = document.getElementById('movie_rel_date-edit')
const editMoviesCategory = document.getElementsByName('movie_category-edit')
const editMoviesStatus = document.getElementsByName('movie_status-edit')
const checkMovieStatus = document.getElementById('movie_check-status')
function getMoviesCategoryCheckbox() {
    const listMoviesCategorySelected = []
    for (let i = 0; i < addMoviesCategory.length; i++) {
        if (addMoviesCategory[i].checked) {
            listMoviesCategorySelected.push(addMoviesCategory[i].value);
        }
    }
    return listMoviesCategorySelected.join(',')
}

function getMoviesStatusRadio() {
    var movieStatusSelected
    for (let i = 0; i < addMoviesStatus.length; i++) {
        if (addMoviesStatus[i].checked) {
            movieStatusSelected = addMoviesStatus[i].value;
            break;
        }
    }
    return movieStatusSelected
}

function getMoviesCategoryCheckboxEdit() {
    const listMoviesCategorySelectedEdit = []
    for (let i = 0; i < editMoviesCategory.length; i++) {
        if (editMoviesCategory[i].checked) {
            listMoviesCategorySelectedEdit.push(addMoviesCategory[i].value);
        }
    }
    return listMoviesCategorySelectedEdit
}
function getMoviesStatusRadioEdit() {
    var movieStatusSelectedEdit
    for (let i = 0; i < editMoviesStatus.length; i++) {
        if (editMoviesStatus[i].checked) {
            movieStatusSelectedEdit = editMoviesStatus[i].value;
            break;
        }
    }
    return movieStatusSelectedEdit
}

// Add Movies
btnAddMovies.addEventListener('click', function () {
    var formData = new FormData()
    formData.append('name', addMoviesName.value);
    formData.append('duration', addMoviesDuration.value);
    formData.append('description', addMoviesDes.value);
    formData.append('releaseDate', addMoviesRelDate.value);
    formData.append('director', addMoviesDirectors.value);
    formData.append('actors', addMoviesActors.value);
    formData.append('trailer', addMoviesTrailer.value);
    formData.append('age_restrict', addAgeRestrict.value);
    formData.append('image', addMoviesPoster.files[0]);
    formData.append('status', getMoviesStatusRadio());
    formData.append('category_id', getMoviesCategoryCheckbox());
    axios.post('/admin/addMovie', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => {
        console.log(res)
        if (res.data.code == 200) {
            snackbar('success', '<b>Success: </b>  Add Movies Success', 3000);
            getAllMovies()
        }
        else {
            snackbar('error', `<b>Error: </b> ${res.data.message}`, 3000);
        }
    }).catch(error => {
        snackbar('error', '<b>Error: </b>  Add Movies Fail', 3000);
        console.error(error);
    });
})
// Edit Movies
btnEditMovies.addEventListener('click', function () {
    var formData = new FormData()
    if(checkMovieStatus.style.display === "none"){
        formData.append('status', "1");
    }
    else {
        formData.append('status', getMoviesStatusRadioEdit())
    }
    formData.append('id', editMoviesLabel.getAttribute('movie_id'));
    formData.append('name', editMoviesName.value);
    formData.append('duration', editMoviesDuration.value);
    formData.append('age_restrict', editAgeRestrict.value);
    formData.append('description', editMoviesDes.value);
    formData.append('releaseDate', editMoviesRelDate.value);
    formData.append('director', editMoviesDirectors.value);
    formData.append('actors', editMoviesActors.value);
    formData.append('trailer', editMoviesTrailer.value);
    formData.append('category_id', getMoviesCategoryCheckboxEdit());
    if (editMoviesPoster.value === '') {
        console.log('File is empty')
    }
    else {
        formData.append('image', editMoviesPoster.files[0]);
    }
    axios.post('/admin/updateMovie', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => {
        console.log(res)
        if (res.data.code == 200) {
            snackbar('success', '<b>Success: </b>  Edit Movies Success', 3000);
            getAllMovies()
        }
        else {
            snackbar('error', `<b>Error: </b> ${res.data.message}`, 3000);
        }
    }).catch(error => {
        snackbar('error', '<b>Error: </b>  Edit Movies Fail', 3000);
        console.error(error);
    });
})
function selectMoviesToEdit(id) {
    axios.get('/movie/getMovieById?id=' + id, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            const data = res.data.data[0]
            if(data.status == '1')
            {
                checkMovieStatus.style.display = 'none'
            }
            else 
            {
                checkMovieStatus.style.display = 'block'
            }
            editMoviesLabel.innerHTML = "Edit Movies Id: " + data.id
            editMoviesLabel.setAttribute('movie_id', data.id)
            renderMovieCategoryCheckbox(data.category_id)
            editMoviesName.value = data.name
            editMoviesDes.value = data.description
            editMoviesTrailer.value = data.trailer
            editAgeRestrict.value = data.age_restrict
            editMoviesActors.value = data.actors
            editMoviesDirectors.value = data.director
            editMoviesDuration.value = data.duration
            editMoviesRelDate.value = data.release_date.slice(0, 10)
        })
        .catch(err => {
            console.error(err)
        })
}
function renderMovieCategoryCheckbox(data) {
    listCategorySelected = data.split(',')
    for(var i = 0; i < editMoviesCategory.length; i++)
    {
        editMoviesCategory[i].checked = false
    }
    for(var i = 0; i < editMoviesCategory.length; i++)
    {
        for(var j = 0; j < listCategorySelected.length; j++)
        {
            if(editMoviesCategory[i].value == listCategorySelected[j])
            {
                editMoviesCategory[i].checked = true
            }
        }
    }
}
// Delete Movies Selected
const listMoviesCheckbox = document.getElementsByName('movies_checkbox');

function getDeleteMoviesCheckboxSelected() {
    const listMoviesCheckboxSelected = []
    for (let i = 0; i < listMoviesCheckbox.length; i++) {
        if (listMoviesCheckbox[i].checked) {
            listMoviesCheckboxSelected.push(deleteMoviesSelected(listMoviesCheckbox[i].value));
        }
    }
    return listMoviesCheckboxSelected
}
function deleteMoviesSelected(id) {
    axios.delete('/admin/deleteMovie?id=' + id, {
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
btnDelMovies.addEventListener('click', () => {
    if (getDeleteMoviesCheckboxSelected().length == 0) {
        snackbar('error', '<b>Error: </b>  Nothing To Delete', 3000);
    }
    else {
        Promise.all(getDeleteMoviesCheckboxSelected())
            .then(res => {
                snackbar('success', '<b>Success: </b>  Delete Movies Success', 3000);
            })
            .catch(err => {
                snackbar('error', '<b>Error: </b>  Delete Movies Fail', 3000);
                console.error(err)
            })
        window.location.reload()
    }
})

// Render All Movies
function getAllMovies() {
    axios.get('/admin/getAllMovie', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            renderAllMovies(res.data.data)
        })
        .catch(err => {
            console.error(err)
        })
}
function renderAllMovies(data) {
    listMovies.innerHTML = ''
    data.forEach(element => {
        listMovies.insertAdjacentHTML('beforeend',
            `
        <tr>
            <th scope="row">${element.id}</th>
            <td>${element.name}</td>
            <td><img class="movies_img" src="${element.image}" alt=""></td>
            <td><iframe width="300" height="200" src="${element.trailer}"
                    title="${element.name}" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen></iframe></td>
            <td>${element.status}</td>
            <td><label class="content_checkbox-outer"><input type="checkbox" class="content_checkbox" value="${element.id}"
                        name="movies_checkbox"><span class="checkmark"></span></label></td>
            <td><button type="button" class="btn btn-outline-warning" data-bs-toggle="modal"
                    data-bs-target="#movies_edit-modal" onclick="selectMoviesToEdit(${element.id})">Edit</button></td>
        </tr>
        `)
    });
}
getAllMovies()



