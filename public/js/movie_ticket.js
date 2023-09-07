window.removeEventListener('scroll', scrollHandler)
header[0].style.backgroundColor = '#333633'
header[0].style.position = 'static'

const data = JSON.parse(localStorage.getItem('movieInfo'))

window.addEventListener('load', removeTicketInfo)

const date = new Date()
const dateList = []
for (let i = 0; i < 7; i++) {
    const newDate = new Date()
    newDate.setDate(date.getDate() + i)
    dateList.push(newDate)
}

const formatDate = date => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
}

const formatDateSelect = date => {
    const options = { weekday: 'long', day: 'numeric', month: 'numeric' }
    const arr = date.toLocaleDateString('en-US', options).split(', ')
    return {
        weekday: arr[0].slice(0, 3),
        dateMonth: arr[1]
    }
}

/* The above code is adding an event listener to each element with the class name buy_ticket_step. When
the element is clicked, the code checks if the index of the clicked element is less than the index
of the element with the class name buy_ticket_step-active. If it is, the code adds the class name
buy_ticket_step-active to the clicked element and removes it from the element with the class name
buy_ticket_step-active. The code also displays the element with the index of the clicked element and
hides the element with the index of the element with */

const buyTicketStep = document.querySelectorAll('.buy_ticket_step')
const buyTicketSection = document.querySelectorAll('.movie_ticket_main')
const ticketContainer = document.querySelector('#ticket_wrap')
let activeIndex = 0

const changeTicketSection = (from, to) => {
    if(from == 5) return 0
    buyTicketStep[to].classList.add('buy_ticket_step-active')
    buyTicketStep[from].classList.remove('buy_ticket_step-active')
    buyTicketSection[to].classList.remove('d-none')
    buyTicketSection[from].classList.add('d-none')
    if (to < 1) {
        const selected = document.querySelectorAll('.seat_item-selected')
        ticketContainer.innerHTML = ''
        checkTicketContainer()
        selected.forEach(item => {
            item.classList.remove('seat_item-selected')
            item.classList.add('seat_item-empty')
        })
        localStorage.removeItem('ticketSelected')
    } else if (to < 2) {
        localStorage.removeItem('foodDetail')
        totalFoodPrice.forEach(item => {
            item.innerHTML = '$' + Number(0).toFixed(2)
        })
        priceStorage.food = Number(0).toFixed(2)
        calcTotalPrice()
    }
    if(to == 3){
        showPurchaseInputInfo()
    }
    activeIndex = to
}

formatCategory = category => {
    let words = category.split(',')
    let formattedStr = ''
    for (let i = 0; i < words.length; i++) {
        let word = words[i].trim()
        formattedStr += word + ' | '
    }
    formattedStr = formattedStr.slice(0, -3)
    return formattedStr
}

buyTicketStep.forEach((element, index) => {
    element.addEventListener('click', () => {
        if (index < activeIndex) {
            changeTicketSection(activeIndex, index)
        }
    })
})

/* Creating a seat layout for a theater. */
const seatLayoutElement = document.querySelector('#seat_layout')
const seatOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
let seatNotAvai = []

/* This code is adding a click event listener to each element with the class name "seat_item". When a
seat is clicked, the code checks if the seat is empty and if the number of selected tickets is less
than 6. If both conditions are true, the code adds a new ticket item to the ticket container with
the row and seat number of the selected seat, and adds the class name "seat_item-selected" to the
selected seat. The code also saves the selected seat in local storage. If the selected seat is
already selected, the code removes the ticket item from the ticket container, removes the class name
"seat_item-selected" from the selected seat, and removes the selected seat from local storage. The
function "checkTicketContainer" is called to update the display of the ticket container. */

const setSeatEvent = () => {
    const seats = document.querySelectorAll('.seat_item')
    seats.forEach(element => {
        element.addEventListener('click', () => {
            let ticketItem = document.querySelectorAll('.ticket_item')
            const row = element.getAttribute('data-row')
            const seatOrder = element.getAttribute('data-seat')
            const theaterInfo = JSON.parse(localStorage.getItem('theaterInfo'))
            if (element.classList.contains('seat_item-empty') && ticketItem.length < 6) {
                ticketContainer.insertAdjacentHTML('afterbegin',
                    `<div class="ticket_item ${row + seatOrder}_ticket">
                        <p class="d-flex align-items-center">Row<span class="fs-4 fw-semibold mx-2">${row}</span></p>
                        <p class="d-flex align-items-center">Seat<span class="fs-4 fw-semibold mx-2">${seatOrder}</span></p>
                        <p class="text-secondary-emphasis fs-5">$${theaterInfo.price}</p>
                        <i class="fa-solid fa-xmark text-white fs-4 delete_ticket_item" onclick="deleteTicketItem('${row + seatOrder}')"></i>
                    </div>`
                )
                element.classList.remove('seat_item-empty')
                element.classList.add('seat_item-selected')
                checkTicketContainer()
                saveSeatSelected(row + seatOrder, 'add')
                calcTicketPrice(theaterInfo)
            } else if (element.classList.contains('seat_item-selected')) {
                deleteTicketItem(row + seatOrder)
                saveSeatSelected(row + seatOrder, 'remove')
                calcTicketPrice(theaterInfo)
            }
        })
    })
}

const renderSeat = () => {
    seatLayoutElement.innerHTML = ''
    for (let i = 0; i < 12; i++) {
        if (i === 7) {
            seatLayoutElement.insertAdjacentHTML('beforeend', '<div class="seat_layout_row d-flex mt-3"></div>')
        } else {
            seatLayoutElement.insertAdjacentHTML('beforeend', '<div class="seat_layout_row d-flex"></div>')
        }
        let lastRow = document.querySelector('.seat_layout_row:last-child')
        lastRow.insertAdjacentHTML('beforeend', `<div class="seat_order" style="top: ${i >= 7 ? 36 * i + 22 : 36 * i + 6}px;">${seatOrder[i]}</div>`)
        for (let j = 0; j < 17; j++) {
            if ((i === 0 && j === 11) || (i === 1 && j === 13) || (i < 7 && j === 15)) {
                break
            } else {
                let seatState = 'seat_item-empty'
                if (seatNotAvai.includes(seatOrder[i] + (j + 1))) { seatState = 'seat_item-lock' }
                lastRow.insertAdjacentHTML('beforeend', `<div class="seat_item ${seatState} ${seatOrder[i] + (j + 1)}_seat" data-row="${seatOrder[i]}" data-seat="${j + 1}">${j + 1}</div>`)
            }
        }
    }
}

const totalPriceEle = document.querySelector('#total_ticket_item')
const ticketCancel = document.querySelectorAll('.cancel_ticket_btn')
const nextStepBtn = document.querySelectorAll('.next_step_ticket_btn')

const checkTicketContainer = () => {
    if (ticketContainer.childNodes.length === 0) {
        totalPriceEle.style.display = 'none'
        ticketCancel[0].style.display = 'none'
        nextStepBtn[0].style.display = 'none'
    } else {
        totalPriceEle.style.display = 'block'
        ticketCancel[0].style.display = 'block'
        nextStepBtn[0].style.display = 'block'
    }
}
checkTicketContainer()

const deleteTicketItem = seatId => {
    const ticket = document.querySelector(`.${seatId}_ticket`)
    const seat = document.querySelector(`.${seatId}_seat`)
    const ticketSelected = JSON.parse(localStorage.getItem('ticketSelected'))
    const index = ticketSelected.indexOf(seatId)
    ticketSelected.splice(index, index + 1)
    if (seat.classList.contains('seat_item-selected')) {
        localStorage.setItem('ticketSelected', JSON.stringify(ticketSelected))
        calcTicketPrice(JSON.parse(localStorage.getItem('theaterInfo')))
        ticket.remove()
        seat.classList.remove('seat_item-selected')
        seat.classList.add('seat_item-empty')
        checkTicketContainer()
    }
}

/**
 * This function saves or removes a selected seat in local storage based on the given action.
 * @param seat - The seat that is being selected or removed.
 * @param action - The action parameter is a string that specifies the action to be performed on the
 * selected seat. It can be either 'add' to add the seat to the list of selected seats, 'remove' to
 * remove the seat from the list of selected seats, or 'clear' to remove all selected seats from
 */
const saveSeatSelected = (seat, action) => {
    const init = JSON.parse(localStorage.getItem('ticketSelected'))
    if (action === 'add') {
        if (init) {
            localStorage.setItem('ticketSelected', JSON.stringify([...init, seat]))
        } else {
            localStorage.setItem('ticketSelected', JSON.stringify([seat]))
        }
    } else if (action === 'remove') {
        init.splice(init.indexOf(seat), 1)
        localStorage.setItem('ticketSelected', JSON.stringify(init))
    } else {
        localStorage.removeItem('ticketSelected')
    }
}

const totalTicketPrice = document.querySelectorAll('.total_ticket_price')
const totalPrice = document.querySelectorAll('.total_price')

const priceStorage = {
    ticket: 0,
    food: 0,
}

const calcTotalPrice = () => {
    const price = Number(priceStorage.ticket) + Number(priceStorage.food)
    totalPrice.forEach(item => {
        item.innerHTML = `$${price.toFixed(2)}`
    })
}

const calcTicketPrice = theaterInfo => {
    const seatList = JSON.parse(localStorage.getItem('ticketSelected'))
    const ticketPrice = Number(seatList.length * theaterInfo.price).toFixed(2)
    priceStorage.ticket = ticketPrice
    calcTotalPrice()
    totalTicketPrice.forEach(item => {
        item.innerHTML = '$' + ticketPrice
    })
}

const cancelSeatBtn = document.querySelector('#cancel_seat_btn')
const nextStepSeatBtn = document.querySelector('#next_seat_btn')
const ticketSeat = document.querySelectorAll('.ticket_seat')

const formatSeat = () => {
    const seats = JSON.parse(localStorage.getItem('ticketSelected'))
    let result = ''
    seats.forEach((item, index) => {
        result += item + (index === seats.length - 1 ? '' : ', ')
    })
    return result
}

cancelSeatBtn.addEventListener('click', () => {
    localStorage.removeItem('ticketSelected')
    ticketContainer.innerHTML = ''
    changeTicketSection(1, 0)
    const selectedSeat = document.querySelectorAll('.seat_item-selected')
    selectedSeat.forEach(element => {
        element.classList.remove('seat_item-selected')
        element.classList.add('seat_item-empty')
    })
    checkTicketContainer()
})

const foodContainer = document.querySelector('#food_container')
const totalFoodPrice = document.querySelectorAll('.total_food_price')

const calcFoodPrice = (id, price, quantity) => {
    let foodDetail = JSON.parse(localStorage.getItem('foodDetail'))
    let foodPrice = 0
    if (foodDetail == null) {
        foodDetail = [{ id: id, price: price, quantity: quantity }]
        localStorage.setItem('foodDetail', JSON.stringify([{ id: id, price: price, quantity: quantity }]))
    } else {
        let flag = false
        foodDetail.forEach(item => {
            if (item.id == id) {
                flag = true
                item.quantity = quantity
            }
        })
        if (!flag) {
            foodDetail.push({ id: id, price: price, quantity: quantity })
        }
        localStorage.setItem('foodDetail', JSON.stringify(foodDetail))
    }
    foodDetail.forEach(item => {
        foodPrice += Number(item.price) * Number(item.quantity)
    })
    totalFoodPrice.forEach(item => {
        item.innerHTML = '$' + foodPrice.toFixed(2)
    })
    priceStorage.food = foodPrice.toFixed(2)
    calcTotalPrice()
}

const setFoodEvent = () => {

    const increaseFood = document.querySelectorAll('.increase_quantity_food')
    const decreaseFood = document.querySelectorAll('.decrease_quantity_food')

    increaseFood.forEach(element => {
        element.addEventListener('click', () => {
            const quantityEle = element.previousElementSibling
            const quantity = Number.parseInt(quantityEle.innerHTML)
            const price = quantityEle.getAttribute('data-price')
            const id = quantityEle.getAttribute('data-id')
            if (quantity < 9) {
                quantityEle.innerHTML = quantity + 1
                calcFoodPrice(id, price, quantity + 1)
            }
        })
    })

    decreaseFood.forEach(element => {
        element.addEventListener('click', () => {
            const quantityEle = element.nextElementSibling
            const quantity = Number.parseInt(quantityEle.innerHTML)
            const price = quantityEle.getAttribute('data-price')
            const id = quantityEle.getAttribute('data-id')
            if (quantity > 0) {
                quantityEle.innerHTML = quantity - 1
                calcFoodPrice(id, price, quantity - 1)
            }
        })
    })
}

const renderFood = data => {
    foodContainer.innerHTML = ''
    data.forEach(item => {
        foodContainer.insertAdjacentHTML('beforeend', `
            <div class="d-flex">
                <img src="${item.image}" alt="">
                <div class="d-flex flex-column justify-content-between">
                    <div>
                        <h5 style="color: var(--header-color) !important;">${item.name}</h5>
                        <p>${item.description}</p>
                        <p>Cost: <span>$${item.price}</span></p>
                    </div>
                    <div class="d-flex">
                        <button class="decrease_quantity_food" style="border-radius: 4px;"><i
                                class="fa-solid fa-caret-left"></i></button>
                        <div class="food_quantity" data-id="${item.id}" data-price="${item.price}">0</div>
                        <button class="increase_quantity_food" style="border-radius: 4px;"><i
                                class="fa-solid fa-caret-right"></i></button>
                    </div>
                </div>
            </div>
        `)
    })
}

const getFood = () => {
    axios.get('/ticket/getFoodCombo')
        .then(res => {
            renderFood(res.data.data)
        })
        .then(() => {
            setFoodEvent()
        })
        .catch(err => {
            console.error(err)
        })
}

nextStepSeatBtn.addEventListener('click', () => {
    const seatFormat = formatSeat()
    ticketSeat.forEach(item => {
        item.innerHTML = seatFormat
    })
    getFood()
    changeTicketSection(1, 2)
})

const nextFoodBtn = document.querySelector('#next_food_btn')
const prevFoodBtn = document.querySelector('#prev_food_btn')

nextFoodBtn.addEventListener('click', () => {
    changeTicketSection(2, 3)
})

prevFoodBtn.addEventListener('click', () => {
    changeTicketSection(2, 1)
})

const movieInfo = document.querySelector('#movie_info')
const poster = document.querySelector('#poster')

const renderMovieInfo = () => {
    poster.setAttribute('src', data.image)
    movieInfo.insertAdjacentHTML('beforeend', `
        <image id="movie_ticket_poster" src="${data.image}" alt="" />
        <div class="flex-grow-1">
            <div class="d-flex align-items-center">
                <h1 id="movie_ticket_title">${data.name}</h1>
                <div id="age_restrict">${data.age_restrict}</div>
            </div>
            <p class="py-1"><span class="text-hightlight">Director: </span>${data.director}</p>
            <p class="py-1"><span class="text-hightlight">Main cast: </span>${data.actors}</p>
            <p class="py-1"><span class="text-hightlight">Release day: </span>${formatDateTime(data.release_date)}</p>
            <p class="py-1"><span class="text-hightlight">Duration: </span>${data.duration} min</p>
            <p class="py-1"><span class="text-hightlight">Genres: </span>${formatCategory(data.categories)}</p>
            <p class="py-1">
                <span class="text-hightlight">Storyline: </span>
                ${data.description}
            </p>
            <button id="trailer_btn" class="position-relative btn_config" data-bs-toggle="modal" data-bs-target="#trailer"
                style="background-color: var(--pri-btn-color);" data-link="${formatTrailerLink(data.trailer)}">
                <div class="custom_btn">
                    Watch trailer
                </div>
            </button>
        </div>
    `)
    handleTrailerEvent()
}

renderMovieInfo()

const theaterContainer = document.querySelector('#theater_container')

const formatTime = time => {
    return time.slice(0, 5)
}

const renderTheater = data => {
    theaterContainer.innerHTML = ''
    data.forEach(item => {
        const schedule = document.createElement('div')
        schedule.className = 'theater_wrap'
        schedule.insertAdjacentHTML('beforeend', `<div class="theater_title">${item.theatre_name + ' - ' + item.room_type}</div>`)
        const startTime = item.start_times.split(',')
        const endTime = item.end_times.split(',')
        const scheduleTimeId = item.schedule_time_ids.split(',')
        for (let i = 0; i < startTime.length; i++) {
            const scheduleItem = document.createElement('div')
            scheduleItem.className = 'theater_item'
            scheduleItem.setAttribute('data-time', formatTime(startTime[i]) + '-' + formatTime(endTime[i]))
            scheduleItem.setAttribute('data-schedule-time-id', scheduleTimeId[i])
            scheduleItem.setAttribute('data-id', item.theatre_id)
            scheduleItem.innerText = formatTime(startTime[i])
            schedule.appendChild(scheduleItem)
        }
        theaterContainer.insertAdjacentElement('beforeend', schedule)
    })
}

const ticketDate = document.querySelectorAll('.ticket_date')
const ticketTime = document.querySelectorAll('.ticket_time')
const ticketType = document.querySelectorAll('.ticket_type')
const ticketName = document.querySelectorAll('.ticket_name')
const ticketTheater = document.querySelectorAll('.ticket_theater')
const ticketRoom = document.querySelector('#ticket_room')

const setUITheaterInfo = (theaterInfo, time) => {
    ticketDate.forEach(item => {
        item.innerHTML = formatDateTime(theaterInfo.date)
    })
    ticketTime.forEach(item => {
        item.innerHTML = time
    })
    ticketType.forEach(item => {
        item.innerHTML = theaterInfo.room_type
    })
    ticketName.forEach(item => {
        item.innerHTML = data.name
    })
    ticketTheater.forEach(item => {
        item.innerHTML = theaterInfo.theatre_name
    })
    ticketRoom.innerHTML = theaterInfo.room_name
}

const getSeatInfo = scheduleTimeId => {
    axios.get('/ticket/getSeat', {
        params: {
            schedule_time_id: scheduleTimeId
        }
    })
        .then(res => {
            seatNotAvai = res.data.data.seat_names.split(',')
        })
        .then(() => {
            renderSeat()
        })
        .then(() => {
            setSeatEvent()
        })
        .catch(err => {
            console.error(err)
        })
}

const setTimeMovieEvent = () => {
    const theaterElement = document.querySelectorAll('.theater_item')
    theaterElement.forEach(element => {
        element.addEventListener('click', () => {
            const theaterListInfo = JSON.parse(localStorage.getItem('theatersInfo'))
            const time = element.getAttribute('data-time')
            const theaterId = element.getAttribute('data-id')
            const scheduleTimeId = element.getAttribute('data-schedule-time-id')
            const ticketInfo = theaterListInfo.filter(item => item.theatre_id == theaterId)
            localStorage.setItem('scheduleTimeId', scheduleTimeId)
            localStorage.setItem('theaterInfo', JSON.stringify(ticketInfo[0]))
            localStorage.setItem('time', time)
            getSeatInfo(scheduleTimeId)
            setUITheaterInfo(ticketInfo[0], time)
            changeTicketSection(0, 1)
        })
    })
}

const timeSelect = document.querySelector('#time_select')

const renderDateSelect = () => {
    dateList.forEach(item => {
        const { weekday, dateMonth } = formatDateSelect(item)
        timeSelect.insertAdjacentHTML('beforeend', `
            <div class="d-flex flex-1 align-items-end p-2 date_item">
                <p class="p-1 mb-0">${weekday}</p>
                <h3 class="p-1 mb-0">${dateMonth}</h3>
            </div>
        `)
    })
}

renderDateSelect()

const dateItem = document.querySelectorAll('.date_item')
let dateActive = 0

const getMovieTheaterInfo = (date, order) => {
    axios.get('/ticket/getMovieSchedule', {
        params: {
            movie_id: data.id,
            date: formatDate(date)
        }
    })
        .then(res => {
            dateItem[dateActive].classList.remove('active')
            dateItem[order].classList.add('active')
            dateActive = order
            localStorage.setItem('theatersInfo', JSON.stringify(res.data.data))
            renderTheater(res.data.data)
        })
        .then(() => {
            setTimeMovieEvent()
        })
        .catch(err => {
            console.error(err)
        })
}

dateItem.forEach((item, index) => {
    item.addEventListener('click', () => {
        getMovieTheaterInfo(dateList[index], index)
    })
})

getMovieTheaterInfo(dateList[0], 0)

const purchaseBtn = document.querySelector('#purchase_btn')
const purchaseInfo = document.querySelectorAll('.purchase_info')
const ticketError = document.querySelectorAll('.ticket_error')
const purchaseUI = document.querySelector('#purchase_ui')
const purchaseSuccess = document.querySelector('#purchase_success')

const showPurchaseInputInfo = () => {
    purchaseUI.style.display = 'block'
    purchaseSuccess.style.display = 'none'
}

const showTicketSuccessUI = () => {
    purchaseUI.style.display = 'none'
    purchaseSuccess.style.display = 'flex'
}

purchaseBtn.addEventListener('click', () => {
    let flag = false
    purchaseInfo.forEach((item, index) => {
        const value = item.value
        if(index != 5){
            ticketError[index].innerHTML = ''
        }
        if(index == 0 && value == ''){
            flag = true
            ticketError[index].innerHTML = 'Please enter your firstname'
        }
        if(index == 1 && value == ''){
            flag = true
            ticketError[index].innerHTML = 'Please enter your lastname'
        }
        if(index == 2 && value == ''){
            flag = true
            ticketError[index].innerHTML = 'Please enter your card number'
        }else if(index == 2 && value.length != 16){
            flag = true
            ticketError[index].innerHTML = 'Card number must contain 16 numbers'
        }
        if(index == 3 && value == ''){
            flag = true
            ticketError[index].innerHTML = 'Please enter card expiration date'
        }
        if(index == 4 && value == ''){
            flag = true
            ticketError[index].innerHTML = 'Please enter cvv'
        }else if(index == 4 && value.length != 3){
            flag = true
            ticketError[index].innerHTML = 'CVV must contain 3 numbers'
        }
        if(index == 6 && value == ''){
            flag = true
            ticketError[index].innerHTML = 'Please enter Postal code'
        }else if(index == 6 && value.length != 5){
            flag = true
            ticketError[index].innerHTML = 'Postal must contain 5 numbers'
        }
    })
    if (!flag) {
        const theaterInfo = JSON.parse(localStorage.getItem('theaterInfo'))
        const scheduleTimeId = localStorage.getItem('scheduleTimeId')
        const seats = JSON.parse(localStorage.getItem('ticketSelected'))
        const foods = JSON.parse(localStorage.getItem('foodDetail'))
        const foodId = []
        const foodQuantity = []
        foods?.forEach(item => {
            foodId.push(item.id)
            foodQuantity.push(item.quantity)
        })
        axios.post('/ticket/addTicket', {
            schedule_id: theaterInfo.schedule_id,
            schedule_time_id: scheduleTimeId,
            seat: seats.join(','),
            food_combo_id: foodId.join(','),
            food_combo_quantity: foodQuantity.join(','),
        })
            .then(res => {
                if (res.data.code == 200) {
                    showTicketSuccessUI()
                    showToastMes(res.data.message, 'success')
                    activeIndex = 5
                } else {
                    showToastMes(res.data.message, 'fail')
                }
            })
            .catch(err => {
                console.error(err)
            })
    }
})

const paymentMethod = document.querySelectorAll('.payment_icon')

paymentMethod.forEach(item => {
    item.addEventListener('click', () => {
        const paymentActive = document.querySelectorAll('.payment-active')[0]
        paymentActive.classList.remove('payment-active')
        item.classList.add('payment-active')
    })
})

const checkHistory = () => {
    changePath('history')
}