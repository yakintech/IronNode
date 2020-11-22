const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://batman:vE9Lu4pTCEdXPX5s@cluster0.pnk3m.gcp.mongodb.net/irondb
`, {useNewUrlParser: true});


const { Schema } = mongoose;

const webuserSchema = new Schema({
    email:String,
    phone:String,
    address:[],
    //add date kolonu data eklendiği an default olarak mevcut tarihi db ye basar
    adddate: {type:Date,default:Date.now},
    //isdeleted kolonu data eklendiği an default olarak false değerini db ye basar. 
    isdeleted:{type:Boolean,default:false}
});

const contactSchema = new Schema({
    title:String,
    email:String,
    content:String,
    adddate: {type:Date,default:Date.now}
})

const Webuser = mongoose.model('Webuser', webuserSchema);
const Contact = mongoose.model('Contact', contactSchema);


module.exports = {
    Webuser,
    Contact
}

//Bu kod satırı ile manuel bir data insert ettim. Bu sayede schema db üzerinde oluşmuş oldu
//  var w = new Webuser({
//      email:"mert.alptekin@bilgeadam.com",
//      phone:"5553265232",
//      address:['Mongo sokak Nodejs mahallesi .Net / İstanbul','Python caddesi MSSQL mahallesi GO / İstanbul']
//  });

//  w.save();


// var c2 = new Contact({
//     title:"Teşekkürlerrrr",
//     email:"polyana@mynet.com",
//     content:"Çok teşekkürler. 256 tane selfie çektirdim bu sipariş sonrası. Çok mutluyum çiçek ve böcek....:):):) KEdim de çok mutlu"
// })

// c2.save();