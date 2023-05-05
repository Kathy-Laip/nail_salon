let express = require('express')
let app = express()

let mysql = require('mysql') // mysql модуль
let con = mysql.createConnection({ // подключение к базе данных
    host: '127.0.0.1',
    user: 'root',
    password: 'regopi09',
    database: 'nail_salon'
});

app.use(express.static('page')) //использование папки pages, в котором хранятся html, css документы

con.connect(function(err){ // попытка подключение к базе данных
    if(err) throw err
    console.log('Connected!')
})

app.listen(3306, function(){ // подклчюение к порту
    console.log('node express work on 3306')
});

app.get('/index.html', async function(req, res){ 
    res.sendFile('index.html', {root : __dirname + '/pages'}) // отсылка html страниц
});


con.query( // взятие данных о пользователях
    'select time_table.id, name, date, time from time_table inner join master on master.id = time_table.id_master where status="свободно" ',
    async function(error, result){
        if(error) throw error;
        result = JSON.parse(JSON.stringify(result))
        app.post('/timeTable', (req,res) => { 
            res.send(result)
        })
    }
)

app.post('/sendData', (req, res) => {
    var info
    req.on('data', chunk =>{
        info = JSON.parse(chunk)
    })
    req.on('end', () => {
        con.query('select id from master where name="'+info.master+'"', 
        async function(err, result){
            let id_mas = JSON.parse(JSON.stringify(result))[0].id
            con.query('update time_table set status="занято" where id_master='+id_mas+' and date="'+info.date+'" and time="'+info.time+'"',
            async function(err, result){
                if(err) res.send({resu: false})  
                else {
                    con.query(`insert into records(master, date, time, surname, email, phone, details) values('${id_mas}', '${info.date}', '${info.time}', '${info.fio}', '${info.email}', '${info.phone}', '${info.details}');`, 
                    async function(err, result){
                        if(err) res.send({resu: false})  
                        else{
                            res.send({resu: true})
                        }
                    }
                    )
                }     
            })
        })
    })
})