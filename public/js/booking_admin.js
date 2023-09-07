var listBooking = document.getElementById('list_booking')

function getAllBooking() {
    axios.get('/admin/getAllTicket', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(res => {
            renderAllBooking(res.data.data)
        })
        .catch(err => {
            console.error(err)
        })
}
function renderAllBooking(data) {
    listBooking.innerHTML = ''
    data.forEach(element => {
        var showDate = element.date.slice(0, 10)
        var createDate = element.createAt.slice(0, 10)
        listBooking.insertAdjacentHTML('beforeend',
            `
            <tr>
                <th scope="row">${element.ticket_id}</th>
                <td>${element.email}</td>
                <td>${element.theatre_id}</td>
                <td>${element.movie_id}</td>
                <td>${showDate}</td>
                <td>${element.food_combo_ids}</td>
                <td>${createDate}</td>
                <td>${element.seat_names}</td>
                <td>${element.total}$</td>
            </tr>

        `)
    });
}
getAllBooking()