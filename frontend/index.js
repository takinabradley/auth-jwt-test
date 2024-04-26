const loginBtn = document.querySelector('.login')
const checkBtn = document.querySelector('.check')

loginBtn.addEventListener('click', () => {
  console.log('logging in ')
  fetch("http://localhost:3000/login")
    .then(res => {
      return res.json()
    })
    .then((json) => {
      localStorage.setItem('token', json.token)
      localStorage.setItem('expires', json.expires)
    })
})

checkBtn.addEventListener('click', () => {
  console.log('fetching')
  fetch("http://localhost:3000/", {headers: {'authorization': localStorage.getItem('token')}})
    .then(res => {
      return res.ok ? res.json() : res.text()
    })
    .then(console.log)
})
