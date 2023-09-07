axios.defaults.timeout = 10000
axios.defaults.maxConcurrentRequests = 5

const getLastPath = href => {
    return href.substring(href.lastIndexOf('/'))
}

const changePath = path => {
    const href = window.location.href
    window.location.href = href.substring(0, href.lastIndexOf('/')) + '/' + path
}

const formatDateTime = datetime => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    return new Date(datetime).toLocaleDateString('en-US', options)
}

let formatCategory = category => {
    let words = category.split(',')
    let formattedStr = ''
    for (let i = 0; i < words.length; i++) {
        let word = words[i].trim()
        formattedStr += word.charAt(0).toUpperCase() + word.slice(1) + ', '
    }
    formattedStr = formattedStr.slice(0, -2)
    return formattedStr
}

const formatTrailerLink = link => {
    return link + '?enablejsapi=1'
}

const handleBuyTicket = id => {
    if(localStorage.getItem('token') != null){
        axios.get('/movie/getMovieById', {
            params: {
                id: id,
            }
        })
            .then(res => {
                localStorage.setItem('movieInfo', JSON.stringify(res.data.data[0]))
                changePath('movieticket')
            })
            .catch(err => {
                console.error(err)
            })
    }else{
        signInModal.classList.add('modal_show')
    }
}

const openMovieContainer = document.querySelector('#open_movie')
const renderOpenMovie = data => {
    openMovieContainer.insertAdjacentHTML('beforeend', `
        <div class="movie_wrap">
            <div class="position-relative">
                <img class="movie_poster" src="${data.image}" alt="movie">
                <button onclick="handleBuyTicket(${data.id})" class="buy_ticket_btn btn_config" style="background-color: var(--pri-btn-color);">
                    <div class="custom_btn">
                        Buy ticket
                    </div>
                </button>
            </div>
            <div class="py-3">
                <p class="movie_name">${data.name}</p>
                <span class="movie_duration">${data.duration} min</span>
                <span class="movie_split mx-1">|</span>
                <span class="movie_category">${formatCategory(data.categories)}</span>
            </div>
        </div>
    `)
}

const comingMovieContainer = document.querySelector('#coming_movie')
const renderComingMovie = data => {
    comingMovieContainer.insertAdjacentHTML('beforeend', `
        <div class="movie_wrap position-relative">
            <img class="movie_poster" src="${data.image}" alt="movie">
            <div class="release_date"><i class="fa-solid fa-calendar-days"></i>${formatDateTime(data.release_date)}</div>
            <div class="p-3">
                <p class="movie_name">${data.name}</p>
                <span class="movie_duration">${data.duration} min</span>
                <span class="movie_split mx-1">|</span>
                <span class="movie_category">${formatCategory(data.categories)}</span>
            </div>
        </div>
    `)
}

const resetOpenMovie = () => {
    openMovieContainer.innerHTML = ''
}

const resetComingMovie = () => {
    comingMovieContainer.innerHTML = ''
}

const removeTicketInfo = () => {
    const label = ['ticketSelected', 'theaterInfo', 'time', 'price', 'foodDetail']
    label.forEach(item => {
        localStorage.removeItem(item)
    })
}

const removeUserInfo = () => {
    localStorage.removeItem('userInfo')
}

const myToastEl = document.querySelector('#toast_mes_container')
const toastMes = document.querySelector('#toast_mes')

const showToastMes = (mes, status) => {
    toastMes.innerHTML = mes
    myToastEl.classList.add('show')
    if (status === 'success') {
        myToastEl.classList.remove('text-bg-danger')
        myToastEl.classList.add('text-bg-success')
    } else {
        myToastEl.classList.remove('text-bg-success')
        myToastEl.classList.add('text-bg-danger')
    }
    setTimeout(() => {
        myToastEl.classList.remove('show')
    }, 3000)
}

/* Changing the background color of the header when the user scrolls down. */
let header = document.getElementsByClassName('header')
let scrollHandler = e => {
    if (this.scrollY >= 30) {
        header[0].style.backgroundColor = '#333633'
    } else {
        header[0].style.backgroundColor = 'rgba(238, 238, 238, 0.1)'
    }
}
window.addEventListener('scroll', scrollHandler)

/* Adding an event listener to each trailer item. When the trailer item is clicked, it will set the src
of the iframe to the data-src attribute of the trailer item. Then it will play the video. */

const handleTrailerEvent = () => {
    const trailerIframe = document.getElementById('trailer_iframe')
    const trailerClose = document.querySelectorAll('.btn-close')
    const trailerItems = document.querySelectorAll('.trailer_item')
    const trailerBtn = document.querySelector('#trailer_btn')

    trailerItems.forEach(trailerItem => {
        trailerItem.addEventListener('click', () => {
            const src = trailerItem.getAttribute('data-src')
            trailerIframe.setAttribute('src', src)
            setTimeout(() => {
                trailerIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
            }, 1000)
        })
    })
    trailerClose.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            trailerIframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')
        })
    })
    trailerBtn?.addEventListener('click', () => {
        const link = trailerBtn.getAttribute('data-link')
        trailerIframe.setAttribute('src', link)
        setTimeout(() => {
            trailerIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
        }, 1000)
    })
}

const blurBG = document.getElementById('blur_bg')
const signInModal = document.getElementById('sign_in_modal')
const signUpModal = document.getElementById('sign_up_modal')
const signInForm = document.getElementById('sign_in_form')
const signUpForm = document.getElementById('sign_up_form')
const closeSignBtn = document.querySelectorAll('.close_sign_modal')
const signInBtn = document.getElementById('sign_in_btn')
const signUpBtn = document.getElementById('sign_up_btn')
const switchForm = document.querySelectorAll('.switch_sign')

const openSignHandle = e => {
    blurBG.style.display = 'block'
    if (e.target.id === 'sign_in') {
        signInModal.classList.add('modal_show')
        signUpModal.classList.remove('modal_show')
    } else {
        signUpModal.classList.add('modal_show')
        signInModal.classList.remove('modal_show')
    }
}

const closeSignHandle = () => {
    blurBG.style.display = 'none'
    signInModal.classList.remove('modal_show')
    signUpModal.classList.remove('modal_show')
    resetInput()
}

const toggleSwitchForm = e => {
    if (e.target.innerText === 'Sign up') {
        signInModal.classList.remove('modal_show')
        signUpModal.classList.add('modal_show')
    } else {
        signUpModal.classList.remove('modal_show')
        signInModal.classList.add('modal_show')
    }
    resetInput()
}

const openSignIn = () => {
    signInModal.classList.add('modal_show')
    signUpModal.classList.remove('modal_show')
}

blurBG.addEventListener('click', closeSignHandle)
closeSignBtn.forEach(element => {
    element.addEventListener('click', closeSignHandle)
})
signInBtn.addEventListener('click', openSignHandle)
signUpBtn.addEventListener('click', openSignHandle)
switchForm.forEach(element => {
    element.addEventListener('click', toggleSwitchForm)
})

const resetInput = () => {
    signInForm.reset()
    signUpForm.reset()
    emailSignInErrMess.innerText = ''
    passSignInErrMess.innerText = ''
    nameErrorMess.innerText = ''
    emailSignUpErrMess.innerText = ''
    passSignUpErrMess.innerText = ''
    confirmPassSignUpErrMess.innerText = ''
}

const emailSignInErrMess = document.getElementById('email_sign_in_error')
const passSignInErrMess = document.getElementById('password_sign_in_error')
const logGroup = document.querySelector('#log_group')
const avatar = document.querySelector('#user_opt_container')

const emailRegex = /^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
/**
 * If the email and password are valid, submit the form. Otherwise, display an error message.
 */
const signInSubmitHandle = () => {
    const email = signInForm.elements['email_sign_in'].value.trim()
    const password = signInForm.elements['password_sign_in'].value.trim()
    if((emailRegex.test(email) && passwordRegex.test(password)) || (email == 'admin' && password == '123456')) {
        axios.post('/login', {
            email: email,
            password: password
        })
            .then(res => {
                let status = 'fail'
                if (res.data.code == 200) {
                    status = 'success'
                    if (res.data.status == 0) {
                        changePath('admin')
                    } else if (res.data.status == 1) {
                        logGroup.style.display = 'none'
                        avatar.style.display = 'block'
                        localStorage.setItem('userInfo', JSON.stringify(res.data.data))
                    }
                    closeSignHandle()
                    axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.accessToken
                    localStorage.setItem('token', res.data.accessToken)
                }
                showToastMes(res.data.message, status)
            })
            .catch(err => {
                console.error(err)
            })
    } else {
        if (email === '') {
            emailSignInErrMess.innerText = 'Please enter your email'
        } else if (!emailRegex.test(email)) {
            emailSignInErrMess.innerText = 'Email is not valid'
        } else {
            emailSignInErrMess.innerText = ''
        }
        if (password === '') {
            passSignInErrMess.innerText = 'Please enter your password'
        } else if (!passwordRegex.test(password)) {
            passSignInErrMess.innerText = 'Password need at least eight characters, one letter and one number'
        } else {
            passSignInErrMess.innerText = ''
        }
    }
}

const nameErrorMess = document.getElementById('name_error')
const emailSignUpErrMess = document.getElementById('email_sign_up_error')
const passSignUpErrMess = document.getElementById('password_sign_up_error')
const confirmPassSignUpErrMess = document.getElementById('password_confirm_sign_up_error')

const signUpSubmitHandle = () => {
    const name = signUpForm.elements['full_name'].value.trim()
    const email = signUpForm.elements['email_sign_up'].value.trim()
    const pass = signUpForm.elements['password_sign_up'].value.trim()
    const confirmPass = signUpForm.elements['confirm_password'].value.trim()
    if (emailRegex.test(email) && passwordRegex.test(pass) && name !== '' && pass === confirmPass) {
        axios.post('/register', {
            name: name,
            email: email,
            password: pass
        })
            .then(res => {
                let status = 'fail'
                if (res.data.code == 200) {
                    status = 'success'
                    openSignIn()
                }
                showToastMes(res.data.message, status)
            })
            .catch(err => {
                console.error(err)
            })
    } else {
        if (name === '') {
            nameErrorMess.innerText = 'Please enter your name'
        } else {
            nameErrorMess.innerText = ''
        }
        if (email === '') {
            emailSignUpErrMess.innerText = 'Please enter your email'
        } else if (!emailRegex.test(email)) {
            emailSignUpErrMess.innerText = 'Email is not valid'
        } else {
            emailSignUpErrMess.innerText = ''
        }
        if (pass === '') {
            passSignUpErrMess.innerText = 'Please enter your password'
        } else if (!passwordRegex.test(pass)) {
            passSignUpErrMess.innerText = 'Password need at least eight characters, one letter and one number'
        } else {
            passSignUpErrMess.innerText = ''
        }
        if (confirmPass === '') {
            confirmPassSignUpErrMess.innerText = 'Please enter confirm password'
        } else if (confirmPass !== pass) {
            confirmPassSignUpErrMess.innerText = 'Wrong confirm password'
        } else {
            confirmPassSignUpErrMess.innerText = ''
        }
    }
}

signInForm.elements['sign_in_btn'].addEventListener('click', signInSubmitHandle)
signUpForm.elements['sign_up_btn'].addEventListener('click', signUpSubmitHandle)

/* A function that toggles the password field between text and password. */
const togglePass = document.querySelectorAll('.toggle_pass')
let isShowPass = false

togglePass.forEach(element => {
    element.addEventListener('click', () => {
        if (isShowPass) {
            signInForm.elements['password_sign_in'].setAttribute('type', 'password');
            signUpForm.elements['password_sign_up'].setAttribute('type', 'password');
            element.firstChild.classList.add('fa-eye')
            element.firstChild.classList.remove('fa-eye-slash')
        } else {
            signInForm.elements['password_sign_in'].setAttribute('type', 'text');
            signUpForm.elements['password_sign_up'].setAttribute('type', 'text');
            element.firstChild.classList.add('fa-eye-slash')
            element.firstChild.classList.remove('fa-eye')
        }
        isShowPass = !isShowPass
    })
})

/* A loader. */
window.addEventListener('load', () => {
    const loader = document.querySelector("#loader")
    loader.classList.add('loader-hidden')
    loader.addEventListener('transitionend', () => {
        loader.remove()
    })
})

const navBtn = document.querySelectorAll('.nav_item')
const navPaths = ['/', '/movie', '/theater', '/support']

if (navPaths.includes(window.location.pathname.toLowerCase())) {
    document.querySelector('.nav-active').classList.remove('nav-active')
    navBtn[navPaths.indexOf(window.location.pathname.toLowerCase())].classList.add('nav-active')
}

/* This code is used to change the page when the user clicks on the navigation bar. */
navBtn.forEach(element => {
    element.addEventListener('click', () => {
        const path = element.getAttribute('data-path')
        changePath(path)
    })
})

if (window.location.pathname.toLowerCase() !== '/movieticket') {
    removeTicketInfo()
    window.removeEventListener('load', removeTicketInfo)
}

const checkAccessToken = () => {
    if (localStorage.getItem('token') !== null) {
        logGroup.style.display = 'none'
        avatar.style.display = 'block'
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')
        axios.get('/checkToken', {
            params: {
                token: localStorage.getItem('token')
            }
        })
        .then(res => {
            if(res.data.code != 200){
                logGroup.style.display = 'block'
                avatar.style.display = 'none'
                removeUserInfo()
                localStorage.removeItem('token')
            }
        })
    } else {
        logGroup.style.display = 'block'
        avatar.style.display = 'none'
        removeUserInfo()
    }
}

checkAccessToken()

const handleLogOut = () => {
    changePath('logout')
    localStorage.removeItem('token')
    checkAccessToken()
}

const profileBtn = document.querySelector('#profile_btn')
const historyBtn = document.querySelector('#history_btn')

profileBtn.addEventListener('click', () => {
    changePath('profile')
})

historyBtn.addEventListener('click', () => {
    changePath('history')
})