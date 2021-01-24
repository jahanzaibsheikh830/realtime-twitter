var SERVER_SECRET = process.env.SECRET || "1234";
// var SERVICE_ACCOUNT = JSON.parse(process.env.SERVICE_ACCOUNT)
const PORT = process.env.PORT || 5000;

var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require("cors");
var morgan = require("morgan");
var path = require("path")
var jwt = require('jsonwebtoken')
var { userModel, tweetModel } = require('./dbconn/modules');
var app = express();
var authRoutes = require('./routes/auth')
var http = require("http");
var socketIO = require("socket.io");
var server = http.createServer(app);
var io = socketIO(server);
const fs = require('fs')
const multer = require('multer')

io.on("connection", () => {
    console.log("chl gya");
})

const storage = multer.diskStorage({ // https://www.npmjs.com/package/multer#diskstorage
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})
var upload = multer({ storage: storage })

const admin = require("firebase-admin");
// https://firebase.google.com/docs/storage/admin/start
var SERVICE_ACCOUNT = JSON.parse(process.env.SERVICE_ACCOUNT)

admin.initializeApp({
    credential: admin.credential.cert(SERVICE_ACCOUNT),
    databaseURL: process.env.databaseURL
});
const bucket = admin.storage().bucket(process.env.bucket);

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(morgan('dev'));
app.use("/", express.static(path.resolve(path.join(__dirname, "public"))))

app.use('/', authRoutes);
app.use(function (req, res, next) {
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate;

            if (diff > 300000) {
                res.status(401).send("token expired")
            } else {
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86400000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                req.headers.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

app.get("/profile", (req, res, next) => {

    console.log(req.body)

    userModel.findById(req.body.jToken.id, 'name email phone gender createdOn profilePic',
        function (err, doc) {
            if (!err) {
                res.send({
                    status: 200,
                    profile: doc
                })

            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })
})
app.post("/tweet", upload.any(), (req, res, next) => {

    console.log("req.body: ", req.body);
    bucket.upload(
        req.files[0].path,
        function (err, file, apiResponse) {
            if (!err) {
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0])
                        userModel.findById(req.headers.jToken.id, 'name profilePic email', (err,user)=>{
                            console.log("user =======>", user.email)
                            if (!err) {
                                tweetModel.create({
                                    "name": user.name,
                                    "tweets": req.body.tweet,
                                   "profilePic": user.profilePic,
                                   "tweetImg": urlData[0],
                                   "email": user.email
                                }).then((data) => {
                                    console.log(data)
                                    res.send({
                                        status: 200,
                                        message: "Post created",
                                        data: data
                                    })
                                    console.log(data)
                                    io.emit("NEW_POST", data)

                                }).catch(() => {
                                    console.log(err);
                                    res.status(500).send({
                                        message: "user create error, " + err
                                    })
                                })
                            }
                            else{
                                res.send("err")
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})

app.post('/textTweet', (req, res, next) => {
    if (!req.body.tweet) {
        res.status(403).send({
            message: "please provide tweet"
        })
    }
    userModel.findOne({email: req.body.jToken.email},(err,user)=>{
        console.log("user =======>", user.email)
        if (!err) {
            tweetModel.create({
                "name": user.name,
                "email": user.email,
                "tweets": req.body.tweet,
                "profilePic": user.profilePic,
            }).then((data) => {
                console.log(data)
                    res.send({
                        status: 200,
                        message: "Post created",
                        data: data
                    })
                    io.emit("NEW_POST", data)
                }).catch(()=>{
                    console.log(err);
                    res.status(500).send({
                        message: "user create error, " + err
                    })
                })   
        }
        else{
            console.log(err)
        }
    })
})

app.get('/getTweets', (req, res, next) => {

    tweetModel.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({data:data});
        }
    })
})
app.get('/myTweets', (req, res, next) => {

    userModel.findOne({email: req.body.jToken.email},(err,user)=>{
        if (!err) {
            tweetModel.find({email:req.body.jToken.email}, (err, data) => {
                if (err) {
                    console.log(err)
                }
                else {
                        res.send({data:data});
                }
            })      
        }
        else{
            console.log(err)
        }
    })
})
app.post("/upload", upload.any(), (req, res, next) => {

    console.log("req.body: ", req.body);
    bucket.upload(
        req.files[0].path,
        function (err, file, apiResponse) {
            if (!err) {
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0])
                        userModel.findOne({ email: req.body.email }, (err, user) => {
                            console.log(user)
                            if (!err) {
                                tweetModel.updateMany({ name: req.headers.jToken.name }, {profilePic:urlData[0]}, (err, tweetModel) => {
                                    console.log(tweetModel)
                                    if (!err) {
                                        console.log("update");
                                    }
                                });
                                user.update({ profilePic: urlData[0] }, (err, updatedProfile) => {
                                    if (!err) {
                                        res.status(200).send({
                                            message: "succesfully uploaded",
                                            url: urlData[0],
                                        })
                                    }
                                    else {
                                        res.status(500).send({
                                            message: "an error occured" + err,
                                        })
                                    }

                                })
                            }
                            else {
                                res.send({
                                    message: "error"
                                });
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})

server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})
