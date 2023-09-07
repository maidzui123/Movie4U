window.removeEventListener('scroll', scrollHandler)
header[0].style.backgroundColor = '#333633'
header[0].style.position = 'static'

const movieTypeBtn = document.querySelectorAll('.movie_btn')

openMovieContainer.style.display = 'grid'
comingMovieContainer.style.display = 'none'

let indexType = 1

movieTypeBtn.forEach((element, index) => {
    element.addEventListener('click', () => {
        const selectedMovieBtn = document.querySelector('.movie_btn-selected')
        indexType = index == 0 ? 1 : 0
        if (!element.isSameNode(selectedMovieBtn)) {
            selectedMovieBtn.classList.remove('movie_btn-selected')
            element.classList.add('movie_btn-selected')
            if (index === 0) {
                openMovieContainer.style.display = 'grid'
                comingMovieContainer.style.display = 'none'
            } else {
                openMovieContainer.style.display = 'none'
                comingMovieContainer.style.display = 'grid'
            }
        }
    })
})

const searchInput = document.querySelector('#movie_search_input')
const searchBtn = document.querySelector('#movie_search_btn')

const getOpenMovie = axios.get('/movie/getAllMovies', {
    params: {
        status: 1
    }
})

const getComingMovie = axios.get('/movie/getAllMovies', {
    params: {
        status: 0
    }
})

const getAllMovie = () => {
    Promise.all([getOpenMovie, getComingMovie])
        .then(([openMovie, comingMovie]) => {
            openMovie.data.data.forEach(item => {
                renderOpenMovie(item)
            })
            comingMovie.data.data.forEach(item => {
                renderComingMovie(item)
            })
        })
        .catch(err => {
            console.error(err)
        })
}

getAllMovie()

const getMovieByKeyWord = keyword => {
    axios.get('/movie/getMovieByName', {
        params: {
            name: keyword,
        }
    })
    .then(res => {
        const filter = res.data.data.filter(item => item.status == indexType)
        if(indexType == 0){
            resetComingMovie()
            filter.forEach(item => {
                renderComingMovie(item)
            })
        }else if(indexType == 1){
            resetOpenMovie()
            filter.forEach(item => {
                renderOpenMovie(item)
            })
        }
    })
    .catch(err => {
        console.error(err)
    })
}

searchBtn.addEventListener('click', () => {
    getMovieByKeyWord(searchInput.value)
})