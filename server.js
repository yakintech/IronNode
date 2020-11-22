const express = require('express');
const { mongo, model } = require('mongoose');
const { Webuser } = require('./Data/mongomodel');
const app = express();
const models =  require('./Data/mongomodel');

app.use(express.urlencoded())
app.use(express.json())


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/',(req,res)=>{
    res.send('OK!');
});

//tüm webuserları getiren API 
app.get('/api/webuser',(req,res)=>{
    
    models.Webuser.find({isdeleted:false},(err,doc)=>{
        //eğer bir hata yoksa dökümanı kullanıcıya gönderiyorum
        if(!err){
            res.json(doc);
        }
        //Hata varsa hatayı kullanıcıya gönderiyorum ( ÖNERİLMEZ! )
        else{
            res.json(err);
        }
    })

})


//Dışarıdan gelen id ye göre webuser ı silen api ucu
app.post('/api/webuser/delete',(req,res)=>{

    let id = req.body.id;

    let webuser = Webuser.findById(id,(err,doc)=>{
        if(!err){
            doc.isdeleted = true;
            doc.save();
            res.json({"msg":"Deleted!"});
        }
        else{
            res.json(err);
        }
    })

})


//Dışarıdan gelen webuser objesine db ye kaydeder
app.post('/api/webuser/add',(req,res)=>{

    let addresses = []

    addresses.push(req.body.address1);
    addresses.push(req.body.address2);
    

    let w = new models.Webuser({
        email:req.body.email,
        phone: req.body.phone,
        address: addresses
    });

    w.save((err,doc)=>{
        if(!err){
            res.json({"msg":"Added!"});
        }
        else{
            res.json(err);
        }
    })
})

//tüm iletişim mesajlarını getiren API
app.get('/api/contact',(req,res)=>{

    models.Contact.find({},(err,doc)=>{
        if(!err){
            res.json(doc);
        }
        else{
            //Burada err loglanmak için bir yere gönderilir ( winston )
            res.status(500).send("Sistemde hata meydana geldi");
        }
    })

})




const port = 3001;
app.listen(port);

