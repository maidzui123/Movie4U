
var selectionTheatres = document.getElementById('timing_theatre-select')
var selectionMovies = document.getElementById('timing_movie-select')
var selectionRooms = document.getElementById('timing_room-select')
var showDate = document.getElementById('show_date')
var startTime = document.getElementById('start_time')
var endTime = document.getElementById('end_time')
var priceMovie = document.getElementById('price_movie')

// Validate Date Of Show
const today = new Date().toISOString().split('T')[0];
showDate.setAttribute('min', today)
// Get All Theatres To Selection
function getAllTheatres() {
    axios.get('/admin/getAllTheatres', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            renderAllTheatresToSelection(res.data.data)
        })
        .catch(err => {
            console.error(err)
        })
}

function renderAllTheatresToSelection(data) {
    data.forEach(element => {
        selectionTheatres.insertAdjacentHTML('beforeend',
            `
        <option value="${element.id}">${element.name}</option>
        `)
    });
}
getAllTheatres()

// Get All Movies To Selection
function getAllMovies() {
    axios.get('/movie/getAllMovies?status=1', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            renderAllMoviesToSelection(res.data.data)

        })
        .catch(err => {
            console.error(err)
        })
}

function renderAllMoviesToSelection(data) {
    data.forEach(element => {
        selectionMovies.insertAdjacentHTML('beforeend',
            `
        <option value="${element.id}">${element.name}</option>
        `)
    });
}
getAllMovies()

// Get All Room Based On Theatre
selectionTheatres.addEventListener("change", function () {
    const selectedTheatre = selectionTheatres.value;
    getRoomsBaseOnTheatre(selectedTheatre)
});
function getRoomsBaseOnTheatre(theatreId) {
    axios.get('/admin/getTheatreById?theatre_id=' + theatreId, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            renderAllRoomsToSelection(res.data.data)
        })
        .catch(err => {
            console.error(err)
        })
}
function renderAllRoomsToSelection(data) {
    selectionRooms.innerHTML = ''
    var room_id = data[0].room_id.split(',')
    var room_name = data[0].room_name.split(',')
    var room_type = data[0].room_type.split(',')

    console.log(room_id)
    console.log(room_name)
    console.log(room_type)
    for (var i = 0; i < room_id.length; i++) {
        selectionRooms.insertAdjacentHTML('beforeend',
            `
        <option value="${room_id[i]}">${room_name[i]}_${room_type[i]}</option>
        `)
    }
}


// Add Schedule

function addSchedule() {
    const dataToAddSchedule =
    {
        movie_id: selectionMovies.value,
        theatre_id: selectionTheatres.value,
        room_id: selectionRooms.value,
        date: showDate.value,
        start_time: startTime.value,
        end_time: endTime.value,
        price: priceMovie.value
    }
    console.log(dataToAddSchedule)
    axios.post('/admin/addSchedule', dataToAddSchedule, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            if (res.data.code == 200) {
                snackbar('success', '<b>Success: </b>  Add Timing Success', 3000);
                getAllTiming()
            }
            else {
                snackbar('error', `<b>Error: </b> ${res.data.message}`, 3000);
            }
        })
        .catch(err => {
            snackbar('error', '<b>Error: </b>  Add Schedule Fail', 3000);
            console.error(err)
        });
}

// Render All Schedule
var listTiming = document.getElementById('list_timing')
function getAllTiming() {
    axios.get('/admin/getAllSchedule', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            renderAllTiming(res.data.data)
        })
        .catch(err => {
            console.error(err)
        })
}
function renderAllTiming(data) {
    listTiming.innerHTML = ''
    data.forEach(element => {
        var timingDate = element.date.slice(0, 10)
        var listStartTime = element.start_times.split(',')
        var listEndTime = element.end_times.split(',')
        for (var i = 0; i < listStartTime.length; i++) {
            listTiming.insertAdjacentHTML('beforeend',
                `
            <tr>
                    <th scope="row">${element.schedule_id}</th>
                    <td>${element.theatre_name}</td>
                    <td>${element.movie_name}</td>
                    <td>${element.room_id}</td>
                    <td>${timingDate}</td>
                    <td>[${listStartTime[i].substring(0, 5)}/${listEndTime[i].substring(0, 5)}]</td>
                    <td>${element.price}</td>
                </tr>
            `)
        }
    });
}
getAllTiming()