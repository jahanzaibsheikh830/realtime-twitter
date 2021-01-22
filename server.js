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
var SERVICE_ACCOUNT = {
    "type": "service_account",
    "project_id": "twitter-profile-pics",
    "private_key_id": "e99858c63c3db8d89e6523ae14b648c6bffd9011",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDIXPS9qALcnAFb\nUW273yLKacncOJYSa9opG0OVe9O9GXfVoSGkLl1KOMWRaUCpigwrQID3AI0X1CSV\n6o6dxWQIIzsdAUXf2ilhkQ+03z902sT5mCXLkSFooyBNSjR9rL2k+N5KeJgN2V6r\nat78kd+v3UKAPCF0+Wp69u3514XvWslabi+Bk/fr05IuuwSi2Q2eU4SFsvSZHhb6\no3Bp/5VIcbVIIO3Z5pTS0B1nsyU5CqCrSLardlXWAaLHNiIcZVCEnlx2IV3bnyTS\nrsIjddC3K6KLRLam4lWRAWdteHhbxcfnsz+153eUa+72phRte0nx1zFLG9gNgCgs\na+UeZdBJAgMBAAECggEAF2kPtNPbTGjImnbahMepik+Z+lUnk7duTLyWxPHW55Kr\njGvAloJO/CEYqcjLzq4Ghfc0xPzCKjVAoROViPGgongbVrmTWc26ZV/29IHb1Dd2\nKa478Zu0ykO6aSLGcfirn97uz3IPshk3v9JDg5c3tOtRSH0TcQDDZDf9zjdUZYbX\npc2NgFYZEOV1rxMnq+oGdaBh1UOut6nfBclsV1JGm6w1IZqFcDrnOB8DuS9m4aHf\nxNCcaaLZQ/9VraRhsxw3/Jn9/5zQHCG8UiNXv1J3t24BkWMT7/md8QKbwDZhxZcY\nlJbsZkaouFEXTVcEHsNePZgMUEfiZf2vO/HkzNAAUQKBgQDyn1oMUzaLHKKjuGks\ncVZBaZZAhbl7n0bJ/QAran4M3pQuhdG38N4S3IOaoUA/wTiOwEi1skA7xmQJtv8R\nvKpamYWDgKEoNU8WlSU6DCzuqEortXH3ASrZiPpVu9adivDron4whIxIoKqRcuiv\nnEJ1aWKJKiNZVyC1opAf+ocY4wKBgQDTaRua2V80rVzXfNgmO4dD3BJhGPm9mau/\n1HqtxXg9umjBRXaxP8+xESXpyJ4iAyPR814bdzUz0ecAzbpcv+fg/Bp/wNoKHKUX\nbWDnhzrrFpRQecCP2VQPfXeNsvzEnioEZjXIuPzk5q24UuVrOKfKeKTS//pSeZGC\niAmokMl14wKBgQDthWFjlYddMwBp5VxZXO9DhHnK2t9WDf0AO4YR+uRB9xj8XpeM\nSustbeIM3HYItEGJRucnscS+gB9pf1RAagIgRhF2RtP+iAnQItzZ8hd+4RQTrENQ\nvDzV0Aq7KfQWMXJgTKjbGLg5VckGMYdofEJ3rV8Ax1bp3KkyCF6uX9YoXwKBgQCY\nad6M9Mm+oH2enVL3vVL3iWF2vxrNpkw8MGOBhCv71LhRHlND1k1VypcaxJe8zaa1\nZk8iXf7tLRbtbWQ+GdyCRz6Te+W2BJDBIwoJ4WSIt+6VVjGNg5Em2b2nWrMAzUZd\nhZKg8zzfia8UhC8B7gaJ4hByTjmZ3CsbgBf2fuu/IQKBgQDete8Ij/1QnHRN7U3i\np735JUv5d0/YG93y8l4QtwB6xBBS2vXZLOCH/39v0KZeXaJyzMmfXrUFL6SG8w3Q\nZVc0uaMi7Ebs9rVl5eKjhKrc0sNXCPJXbMfYAeHQpuVnCaF6IKslTx5bL/sTQmEq\nXbhKEaA61d4lG5PRgn/o1T+I0Q==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-nrq5c@twitter-profile-pics.iam.gserviceaccount.com",
    "client_id": "110265852152524228238",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-nrq5c%40twitter-profile-pics.iam.gserviceaccount.com"
}

admin.initializeApp({
    credential: admin.credential.cert(SERVICE_ACCOUNT),
    databaseURL: "https://twitter-profile-pics-default-rtdb.firebaseio.com"
});
const bucket = admin.storage().bucket("gs://twitter-profile-pics.appspot.com");

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
                        userModel.findById(req.headers.jToken.id, 'name profilePic', (err,user)=>{
                            console.log(user)
                            if (!err) {
                                tweetModel.create({
                                    "name": user.name,
                                    "tweets": req.body.tweet,
                                   "profilePic": user.profilePic,
                                   "tweetImg": urlData[0]
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

// app.post('/tweet', (req, res, next) => {
//     if (!req.body.tweet) {
//         res.status(403).send({
//             message: "please provide tweet"
//         })
//     }
//     userModel.findOne({email: req.body.jToken.email},(err,user)=>{
//         console.log(user)
//         if (!err) {
//             tweetModel.create({
//                 "name": user.name,
//                 "tweets": req.body.tweet,
//                 "profilePic": user.profilePic
//             }).then((data) => {
//                 console.log(data)
//                     res.send({
//                         status: 200,
//                         message: "Post created",
//                         data: data
//                     })
//                     io.emit("NEW_POST", data)

//                 }).catch(()=>{
//                     console.log(err);
//                     res.status(500).send({
//                         message: "user create error, " + err
//                     })
//                 })   
//         }
//         else{
//             console.log(err)
//         }
//     })
// })

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
