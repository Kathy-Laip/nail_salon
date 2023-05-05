var request = new XMLHttpRequest()

request.open('POST', '/timeTable', true)

const p = new Promise((res, rej) => {
    request.onload = () => {
        var timeTable = request.responseText
        res(timeTable)
    }
}).then(timeTable => {
    getProducts(timeTable)
})

async function getProducts(timeTable){
    timeTable = JSON.parse(timeTable)

    let master = new Set()
    for (let obj of timeTable){
        master.add(obj.name)
    }

    function insertIntoMaster(nameMaster){
        var container = document.getElementById('master')
        for(let name of nameMaster){
            var text = `<option value="${name}">${name}</option>`
            container.innerHTML += text
        }
    }

    insertIntoMaster(master)

    document.getElementById('master').addEventListener('change', function(){
        let dateChange = document.getElementById('date')
        dateChange.innerHTML = '<option value=""></option>'
        let name = this.value

        var date = timeTable.filter(obj => obj.name === name)
        let dateTimetable = new Set()
        for (let obj of date){
            dateTimetable.add(obj.date)
        }
        for(let d of dateTimetable){
            dateChange.innerHTML += `<option value="${d}">${d}</option>`
        }
    })

    document.getElementById('date').addEventListener('change', function(){
        let timeChange = document.getElementById('time')
        timeChange.innerHTML = '<option value=""></option>'
        let nameMaster = document.getElementById('master').value
        let date = this.value

        var times = timeTable.filter(obj => obj.date === date && obj.name === nameMaster)
        for(let t of times){
            timeChange.innerHTML += `<option value="${t.time}">${t.time}</option>`
        }
    })

    var selectBtn = document.getElementsByClassName("ch");
    for(let i = 0; i < selectBtn.length; i++){
        selectBtn[i].addEventListener('click',  function(e) {
            var parent = e.target.closest(".info")
            var text = parent.querySelector('li').innerHTML
            sessionStorage.setItem('selectChoise', text)
        }, false)
    }

    const btnO = document.querySelector('.btnOrder')
    btnO.addEventListener('click', () => {
        const fio = document.getElementById('fio').value
        const phone = document.getElementById('phone').value
        const email = document.getElementById('email').value
        const master = document.getElementById('master').value
        const date = document.getElementById('date').value
        const time = document.getElementById('time').value
        if(sessionStorage.getItem('selectChoise') != null){
            let mas = [fio, phone, email, master, date, time]
            if(mas.every(el => el !== '')){
                mas = {"fio": fio, "phone": phone, "email": email, "master": master, "date": date,  "time": time, "details": sessionStorage.getItem('selectChoise')}
                async function sendData(){
                    let response = await fetch('/sendData', {
                        method: 'POST',
                        body: JSON.stringify(mas),
                        headers: {
                            'Accept' : 'application/json',
                            'Content-Type' : 'appliction/json'
                        }
                    }) 
                    let result = await response.json()

                    if(result.resu == true){
                        alert('Вы успешно записались на процедуру!')
                    } else alert('Что-то пошло нет так...')
                }
                sendData()
            } else alert('Заполните все поля!')
        } else alert('Выберите услугу!')
    })

}

request.send()