const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://user_cagatay:ai2GFv4N8Hwfq5sO@cluster0.ol2mp.mongodb.net/ironecommerce?authSource=admin&replicaSet=atlas-75f4ea-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useNewUrlParser: true })



const { Schema } = mongoose;

const webuserSchema = new Schema({
    email: String,
    phone: String,
    address: [],
    //add date kolonu data eklendiği an default olarak mevcut tarihi db ye basar
    adddate: { type: Date, default: Date.now },
    //isdeleted kolonu data eklendiği an default olarak false değerini db ye basar. 
    isdeleted: { type: Boolean, default: false }
});

const contactSchema = new Schema({
    title: String,
    email: String,
    content: String,
    adddate: { type: Date, default: Date.now }
});


const adminSchema = new Schema({
    email: String,
    password: String
});

const productSchema = new Schema({
    name: String,
    description: String,
    images: [],
    price: Number,
    categories: [],
    code: String,
    //add date kolonu data eklendiği an default olarak mevcut tarihi db ye basar
    adddate: { type: Date, default: Date.now },
    //isdeleted kolonu data eklendiği an default olarak false değerini db ye basar. 
    isdeleted: { type: Boolean, default: false }
});

const categorySchema = new Schema({
    name: String,
    adddate: { type: Date, default: Date.now },
    isdeleted: { type: Boolean, default: false }
})

const Webuser = mongoose.model('Webuser', webuserSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Adminuser = mongoose.model('Adminuser', adminSchema);
const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category',categorySchema);


module.exports = {
    Webuser,
    Contact,
    Adminuser,
    Product,
    Category
}




// var w = new Adminuser({
//     email:'cagatay.yildiz@bilgeadam.com',
//     password:'123'
// })

// w.save((err,doc)=>{
//     console.log(err)
// });
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