window.removeEventListener('scroll', scrollHandler)
header[0].style.backgroundColor = '#333633'
header[0].style.position = 'static'

const userInfoItem = document.querySelectorAll('.user_info_item')
const userInfo = JSON.parse(localStorage.getItem('userInfo'))

const formatDateForInput = date => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
}

const saveUserInfo = () => {
    const name = document.querySelector('#full_name_profile')
    const phone = document.querySelector('#phone')
    const address = document.querySelector('#address')
    const birthday = document.querySelector('#birthday')
    axios.post('/updateUserInfo', {
        name : name.value,
        phone : phone.value,
        birthday : birthday.value,
        address : address.value
    })
    .then(res => {
        if(res.data.code == 200){
            showToastMes(res.data.message, 'success')
            localStorage.setItem('userInfo', {
                ...JSON.parse(localStorage.getItem('userInfo')),
                name : name.value,
                phone : phone.value,
                birthday : birthday.value,
                address : address.value
            })
        }else{
            showToastMes(res.data.message, 'fail')
        }
    })
    .catch(err => {
        console.error(err)
    })
}

const handleEditBtn = (input , btn) => {
    if(btn.children[0].classList.contains('fa-pencil')){
        btn.children[0].classList.remove('fa-pencil')
        btn.children[0].classList.add('fa-floppy-disk')
        input.disabled = false
    }else if(btn.children[0].classList.contains('fa-floppy-disk')){
        btn.children[0].classList.remove('fa-floppy-disk')
        btn.children[0].classList.add('fa-pencil')
        input.disabled = true
        saveUserInfo()
    }
}

if(userInfo != null){
    userInfoItem.forEach((item,index) => {
        const curr = item.querySelector('input')
        const editBtn = item.querySelector('span')
        switch (index){
            case 0:
                curr.value = userInfo.name
                break
            case 1:
                curr.value = userInfo.email
                break
            case 2:
                curr.value = userInfo.phone
                break
            case 3:
                curr.value = userInfo.address
                break
            case 4:
                curr.value = formatDateForInput(new Date(userInfo.birthday))
                break
        }
        editBtn?.addEventListener('click', () => {
            handleEditBtn(curr, editBtn)
        })
    })
}

const forgetPassToggle = document.querySelectorAll('.toggle_pass_forget')

forgetPassToggle.forEach(item=> {
    item.addEventListener('click', () => {
        const input = item.parentNode.children[0]
        const state = input.getAttribute('data-show')
        if(state == 'true'){
            input.setAttribute('type', 'password')
            input.setAttribute('data-show', 'false')
        }else{
            input.setAttribute('type', 'text')
            input.setAttribute('data-show', 'true')
        }
    })
})

const changePassBtn = document.querySelector('#change_pass_btn')
var modal = new bootstrap.Modal('#change_pass_modal');

changePassBtn.addEventListener('click', () => {
    const currPassword = document.querySelector('#curr_pass').value
    const newPassword = document.querySelector('#new_pass').value
    const confirmNewPassword = document.querySelector('#confirm_new_pass').value
    const errMes = document.querySelectorAll('.error_mess')
    if(passwordRegex.test(currPassword) && passwordRegex.test(newPassword) && newPassword == confirmNewPassword){
        axios.post('/changePassword', {
            password : currPassword,
            newPassword : newPassword,
            confirmPassword : confirmNewPassword
        })
        .then(res => {
            if(res.data.code == 200){
                showToastMes(res.data.message, 'success')
                modal.hide();
                errMes.forEach(item => {
                    item.innerHTML = ''
                })
            }else{
                showToastMes(res.data.message, 'fail')
            }
        })
        .catch(err => {
            console.error(err)
        })
    }else{
        if(!passwordRegex.test(currPassword) || currPassword == ''){
            const password = document.querySelector('#curr_pass_error')
            password.innerHTML = 'Password is invalid'
        }
        if(!passwordRegex.test(newPassword) || newPassword == ''){
            const password = document.querySelector('#new_pass_error')
            password.innerHTML = 'New password is invalid'
        }
        if(newPassword != confirmNewPassword || confirmNewPassword == ''){
            const password = document.querySelector('#new_pass_confirm_error')
            password.innerHTML = 'Confirm password is invalid'
        }
    }
        
})