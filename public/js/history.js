window.removeEventListener('scroll', scrollHandler)
header[0].style.backgroundColor = '#333633'
header[0].style.position = 'static'

const historyContainer = document.querySelector('#history_container')

const renderHistory = data => {
    historyContainer.innerHTML = ''
    data.forEach((item,index) => {
        historyContainer.insertAdjacentHTML('beforeend', `
            <tr class="text-white">
                <th scope="row">${index}</th>
                <td>${formatDateTime(item.date)}</td>
                <td>${item.movie_name}</td>
                <td>${item.theatre_name}</td>
                <td>${item.room_name}</td>
                <td>$${item.total}</td>
            </tr>
        `)
    })
}

const getHistory = () => {
    axios.get('/ticket/getTicketByAccountId')
    .then(res => {
        renderHistory(res.data.data)
    })
    .catch(err => {
        console.error(err)
    })
}

getHistory()