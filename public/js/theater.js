window.removeEventListener('scroll', scrollHandler)
header[0].style.backgroundColor = '#333633'
header[0].style.position = 'static'

const locateMap = address => {
    const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    window.open(googleMapUrl, '_blank')
}

const theaterEle = document.querySelector('#theater')

const renderTheater = data => {
    theaterEle.innerHTML = ''
    data.forEach(item => {
        theaterEle.insertAdjacentHTML('beforeend', `
            <div class="theater_container">
                <img src="${item.image}" alt="img">
                <div class="d-flex flex-column justify-content-between px-5 w-100">
                    <div>
                        <h3 class="pb-2 text-warning">${item.name}</h3>
                        <p class="py-2">Tel: ${item.tel}</p>
                        <p class="py-2">Address: ${item.address}</p>
                        <p class="py-2">${item.description}</p>
                    </div>
                    <button class="btn btn-success w-50" onclick="locateMap('${item.address}')">Locate in Google Map</button>
                </div>
            </div>
        `)
    })
}

const getTheaterInfo = () => {
    axios.get('/movie/getAllTheatres')
    .then(res => {
        renderTheater(res.data.data)
    })
    .catch(err => {
        console.error(err)
    })
}

getTheaterInfo()