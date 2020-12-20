const express = require('express');
const { mongo, model } = require('mongoose');
const { Webuser } = require('./Data/mongomodel');
const app = express();
const models = require('./Data/mongomodel');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
var nodemailer = require('nodemailer');


var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

const jwtkey = "ironmaiden";
const jwtExpirySeconds = 100000;

// app.use(express.urlencoded())
// app.use(express.json());



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




var tokenmiddleware = function (req, res, next) {


    if (req.originalUrl == "/token" || req.originalUrl.includes("/images/productimages/")) {
        next();
    }
    else {
        let token = req.query.token;

        try {
            let decoded = jwt.verify(token, jwtkey);
            next();
        }
        catch (err) {
            res.status(401).json({ "msg": "Yetkisiz erişim. /token adresinden token alınız" });
        }
    }

};

app.use(tokenmiddleware);


app.get("/images/productimages/:imgpath", (req, res) => {
    res.sendFile(__dirname + "/images/productimages/" + req.params.imgpath);
})

app.get('/', (req, res) => {
    res.send('Hello Digital!');
});


app.post("/token", (req, res) => {

    let email = req.body.email;
    let pwd = req.body.password;

    models.Adminuser.find({ email: email, password: pwd }, (err, doc) => {

        if (doc.length != 0) {
            //token üretilip geri gönderilecek

            const token = jwt.sign({ email }, jwtkey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds
            })
            res.json({ 'token': token });


        }
        else {
            res.status(401).json({ "msg": "Email veya kullanıcı adı yanlış" });
        }

    })


})

//tüm webuserları getiren API 
app.get('/api/webuser', (req, res) => {

    let token = req.query.token;

    try {

        let decoded = jwt.verify(token, jwtkey);

        models.Webuser.find({ isdeleted: false }, (err, doc) => {
            //eğer bir hata yoksa dökümanı kullanıcıya gönderiyorum
            if (!err) {
                res.json(doc);
            }
            //Hata varsa hatayı kullanıcıya gönderiyorum ( ÖNERİLMEZ! )
            else {
                res.json(err);
            }
        })

    }
    catch (err) {

        res.status(401).json({ "msg": "Yetkisiz erişim. /token adresinden token alınız" });

    }

})


//Dışarıdan gelen id ye göre webuser ı silen api ucu
app.post('/api/webuser/delete', (req, res) => {

    let id = req.body.id;

    let webuser = Webuser.findById(id, (err, doc) => {
        if (!err) {
            doc.isdeleted = true;
            doc.save();
            res.json({ "msg": "Deleted!" });
        }
        else {
            res.json(err);
        }
    })

})


//Dışarıdan gelen webuser objesine db ye kaydeder
app.post('/api/webuser/add', (req, res) => {

    let addresses = []

    addresses.push(req.body.address1);
    addresses.push(req.body.address2);


    let w = new models.Webuser({
        email: req.body.email,
        phone: req.body.phone,
        address: addresses
    });

    w.save((err, doc) => {
        if (!err) {
            res.json(doc);
        }
        else {
            res.json(err);
        }
    })
})

//tüm iletişim mesajlarını getiren API
app.get('/api/contact', (req, res) => {

    models.Contact.find({}, (err, doc) => {
        if (!err) {
            res.json(doc);
        }
        else {
            //Burada err loglanmak için bir yere gönderilir ( winston )
            res.status(500).send("Sistemde hata meydana geldi");
        }
    })

})

app.post('/api/contact/add', (req, res) => {

    var contact = new models.Contact({
        title: req.body.title,
        email: req.body.email,
        content: req.body.content
    });

    contact.save((err, doc) => {
        if (!err) {
            res.json({ "msg": "Success!" });
        }
        else {
            res.json(err);
        }
    })

})

app.get('/api/categories', (req, res) => {

    models.Category.find({ isdeleted: false }, (err, doc) => {
        if (!err) {
            res.json(doc);
        }
        else {
            res.json(err);
        }
    })

})

app.post('/api/categories/add', (req, res) => {

    let category = new models.Category({
        name: req.body.name
    });

    category.save((err, doc) => {
        if (!err) {
            res.json(doc);
        }
        else {
            res.json(err);
        }
    })
})


app.get('/api/products/getproductsbycategoryid/:categoryid', (req, res) => {

    let categoryid = req.params.categoryid;

    console.log(categoryid);
    models.Product.find({ isdeleted: false, categories: categoryid }, (err, doc) => {

        if (!err) {
            console.log(doc);
            res.json(doc);
        }
        else {
            res.json(err);
        }

    })
})



app.post('/api/products/add', (req, res) => {


    let filepaths = [];
    for (let i = 0; i < req.body.files.length; i++) {

        var base64Data = req.body.files[i].thumbUrl.replace(/^data:image\/png;base64,/, "");

        let imagename = uuidv4() + ".png";
        require("fs").writeFile(__dirname + "/images/productimages/" + imagename, base64Data, 'base64', function (err) {
        });

        filepaths.push(imagename);
    }




    var product = models.Product({
        name: req.body.data.name,
        description: req.body.data.description,
        categories: req.body.data.categories,
        price: req.body.data.price,
        code: req.body.data.code,
        images: filepaths
    });

    product.save();



    res.json({ "msg": "Success!" });
})

app.get("/api/products", (req, res) => {

    models.Product.find({ isdeleted: false }, (err, doc) => {

        if (!err) {
            res.json(doc);
        }
        else {
            res.json(err);
        }

    })

})

app.post("/api/products/delete", (req, res) => {

    let id = req.body.id;

    models.Product.findById(id, async (err, doc) => {
        if (!err) {
            doc.isdeleted = true;
            await doc.save();
            res.json({ "msg": "Success!" });
        }
        else {
            res.json(err);
        }
    })

})


app.post('/api/adminuser/add', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    var admin = models.Adminuser({
        email: email,
        password: password
    });

    admin.save((err, doc) => {
        if (!err) {
            res.json(doc);
        }
        else {
            res.json(err);
        }
    })
})



var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bilgebatman19@gmail.com',
        pass: 'Superman!35'
    }
});


function SendEMail(mailOptions) {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


app.post('/api/order/add', (req, res) => {

    console.log(req.body);

    var order = new models.Order({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        postalcode: req.body.postalcode,
        orderdetail: req.body.orderdetail,
    });

    order.save((err, doc) => {
        if (!err) {
            //sipariş sonrası yetkiliye email düşüyor...


            let ordermailtext = '<h1>Sitenizden sipariş var!! </h1><h3>' + req.body.name + " " + req.body.surname + " isimli kişinin " + req.body.orderdetail.pcount + " adet siparişi var! </h3> <br>";

            let siparisurun = '';
            req.body.orderdetail.products.forEach(element => {
                siparisurun = siparisurun +  'Ürün adı: ' + element.name + ' Fiyat: ' + element.price + 'Adet: ' + element.count + " <br> ";
            });

            var mailOptions = {
                from: 'bilgebatman19@gmail.com',
                to: 'cagatayyildiz87@gmail.com',
                subject: 'Sipariş',
                text: ordermailtext + siparisurun,
                html:ordermailtext + siparisurun
            };

            SendEMail(mailOptions);


            res.json(doc);
        }
        else {
            res.json(err);
        }
    })
})






const port = 3001;
app.listen(port);

