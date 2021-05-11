const express = require("express");
const { MongoClient } = require("mongodb");
const path = require('path');
const cors = require("cors");
const configs = require("./configs");
const multer = require("multer");
var app = express();
app.use(cors());
app.use(express.json());
PORT = 3000;
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assetsData/uploads");
        console.log(file);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

var upload = multer({ storage: storage });
app.get("/api", (request, response) => {
    console.log("Server listening");
    response.json({ "status:": "garage server running" });
});

app.use(express.static(path.join(__dirname, '/assetsData')));
app.listen(PORT, () => {
    console.log("Server listening on ", PORT);
});
const connectionClient = new MongoClient(configs.db_url_local, { useUnifiedTopology: true });
(async () => {
    let dbConnection;
    let connectedDb;
    dbConnection = await connectionClient.connect();
    connectedDb = dbConnection.db(configs.db_name);
    console.log('Connectd to DB');
    module.exports.connectedDb = connectedDb

    // const authRoutes = require("./routes/auth");

    // app.use("/", authRoutes);

})()
app.post('/addProduct', upload.any(), (request, response) => {
    console.log('request body: ', request.body);
    const productDetails = JSON.parse(request.body.productDetail);
    let logoFile = request.files.filter(file => file.fieldname === 'logoFile')[0];
    let attachmentFile = request.files.filter(file => file.fieldname === 'attacchmentFile')[0];
    console.log('Logo file: ', logoFile, 'Attachment file: ', attachmentFile);
    if (logoFile) {
        var logoUrl = `localhost:3000/uploads/${logoFile.filename}`;
    }
    if (attachmentFile) {
        var attachmentFileUrl = `localhost:3000/uploads/${attachmentFile.filename}`;
    }
    productDetails.logo = logoUrl;
    productDetails.attachmentFileUrl = attachmentFileUrl;
    this.connectedDb.collection('products').insertOne(productDetails).then(resp => {
        response.json({ success: true, message: resp });
    })
})