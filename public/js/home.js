const listTrailer = document.querySelector('#list_trailer')
const carousel = document.querySelector('#carousel') 

const renderTrailer = data => {
    listTrailer.insertAdjacentHTML('beforeend', `
        <div class="trailer_item" data-bs-toggle="modal" data-bs-target="#trailer" data-src="${formatTrailerLink(data.trailer)}">
            <div class="trailer_poster_wrap">
                <img src="${data.image}" alt="trailer">
                <i class="fa-regular fa-circle-play"></i>
            </div>
            <h5>${data.name}</h5>
        </div>
    `)
}

const renderCarousel = data => {
    carousel.innerHTML = ''
    data.forEach((item,index) => {
        carousel.insertAdjacentHTML('beforeend', `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${item.image}" class="d-block w-100 carousel_img" alt="..." data-bs-interval="6000">
            </div>
        `)
    })
}

const getLastedMovie = status => {
    axios.get('/movie/getAllMovies', {
        params: {
            status: status
        }
    })
        .then(res => {
            res.data.data.forEach((item, index) => {
                if (index < 5) {
                    if (status == 1) {
                        renderOpenMovie(item)
                    }else if (status == 0) {
                        renderComingMovie(item)
                    }
                }
            })
        })
        .catch(err => {
            console.error(err)
        })
}

getLastedMovie(0)
getLastedMovie(1)

const getPosters = () => {
    axios.get('/movie/getAllPoster')
    .then(res => {
        listTrailer.innerHTML = ''
        res.data.data.forEach(item => {
            renderTrailer(item)
        })
        renderCarousel(res.data.data)
    })
    .then(() => {
        handleTrailerEvent()
    })
    .catch(err => {
        console.error(err)
    })
}

getPosters()