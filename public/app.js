var url = "http://localhost:5000"
// var url = "https://realtime-twitter-jahanzaib.herokuapp.com"
//user signup request using axios

var socket = io(url);
socket.on('connect', function () {
    console.log("connected")
});

function tweetsBox(name, email, profilepic, tweetimg, date, tweet) {
    let box = `
     <section class="" >
     <div class="container">
         <div class="row justify-content-center">
             <div class="col-md-6   ">
                 <div class="posts">
             <div class="row">
                 <div class="col-md-2 m-0 ">
                     <img style="border-radius: 100%;" width="50" height="50"
                         src="${profilepic}"
                         alt="">
                 </div>
                 <div class="col-md-10 ">
                     <span style="margin:  0; font-weight: bold" >${name}</span>
                     <span class="float-right">${date}</span>
                     <p style="margin:  0;">${email}</p>
                 </div>
             </div>
             <div class="row">
                 <div class="col-md-12">
                     <p class="mt-1">${tweet}</p>
                 </div>
             </div>
             <div class="row">
                 <div class="col-md-12">
                     <img width="100%" src="${tweetimg}" alt="">
                 </div>
             </div> 
             <div class="row">
                 <div class="col-md-12">
                     
                 </div>
             </div>    
         </div>
     </div>
 </div>
     </div>

     </div>
 </section>
    `
    return box
}
function signup() {
    axios({
        method: 'post',
        url: url + '/signup',
        data: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            phone: document.getElementById('phone').value,
            gender: document.getElementById('gender').value,
        },
        withCredentials: true
    }).then((response) => {
        if (response.data.status === 200) {
            alert(response.data.message)
            location.href = "./login.html"
        } else {
            alert(response.data.message);
        }
    }).catch((error) => {
        console.log(error);
    });
    return false
}

//user login request using axios
function login() {
    axios({
        method: 'post',
        url: url + '/login',
        data: {
            email: document.getElementById('lemail').value,
            password: document.getElementById('lpassword').value,
        },
        withCredentials: true
    }).then((response) => {
        if (response.data.status === 200) {
            alert(response.data.message)
            location.href = "./profile.html"
        }
        else {
            alert(response.data.message)
        }
    }, (error) => {
        console.log(error);
    });
    return false
}

//get profile request using axios
function getProfile() {
    axios({
        method: 'get',
        url: url + '/profile',
        credentials: 'include',
    }).then((response) => {
        let src = response.data.profile.profilePic
        document.getElementById('pName').innerHTML = response.data.profile.name
        if (src) {
            document.getElementById('profilePic').style.backgroundImage = `url(${src})`;
        }
        else {
            document.getElementById('profilePic').style.backgroundImage = `url('./fallback.png')`;
        }
        sessionStorage.setItem('email', response.data.profile.email)
    }, (error) => {
        location.href = "./login.html"
    });
    return false
}
function post() {
    var fileInput = document.getElementById("customFile");
    var tweet = document.getElementById('tweet')
    console.log(fileInput.files[0])
    if (fileInput.files[0] === undefined) {
        axios({
            method: 'post',
            url: url + '/textTweet',
            data: {
                tweet: document.getElementById('tweet').value
            },
            withCredentials: true
        }).then((response) => {
            console.log(response.data)
        }).catch((error) => {
            console.log(error);
        });
    }
    else {
        let formData = new FormData();
        formData.append("myFile", fileInput.files[0]);
        formData.append("tweet", tweet.value);

        axios({
            method: 'post',
            url: url + "/tweet",
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(response => {
                console.log("response data=> ", response);
            })
            .catch(err => {
                console.log(err);
            })
    }


    return false;

}

//get all user post or tweet request using axios
function getTweets() {
    axios({
        method: 'get',
        url: url + '/getTweets',
        credentials: 'include',
    }).then((response) => {
        console.log(response.data.data)
        let tweets = response.data.data;
        let html = ""
        tweets.forEach(element => {
            if (element.profilePic) {
                html += tweetsBox(element.name, element.email,
                    element.profilePic, element.tweetImg,
                    new Date(element.createdOn).toLocaleTimeString(), element.tweets)
            }
            else {
                html += tweetsBox(element.name, element.email,
                    './fallback.png', element.tweetImg,
                    new Date(element.createdOn).toLocaleTimeString(), element.tweets)
            }
        });
        document.getElementById('posts').innerHTML = html;
    }, (error) => {
        console.log(error.message);
    });
    return false
}
function myTweets() {
    axios({
        method: 'get',
        url: url + '/myTweets',
        credentials: 'include',
    }).then((response) => {
        console.log(response.data.data)
        let userTweet = response.data.data
        let userHtml = ""
        userTweet.forEach(element => {
            if (element.profilePic) {
                userHtml += tweetsBox(element.name, element.email,
                    element.profilePic, element.tweetImg,
                    new Date(element.createdOn).toLocaleTimeString(), element.tweets)
            }
            else {
                userHtml += tweetsBox(element.name, element.email,
                    './fallback.png', element.tweetImg,
                    new Date(element.createdOn).toLocaleTimeString(), element.tweets)
            }
        });
        document.getElementById('userPosts').innerHTML = userHtml;
    }, (error) => {
        console.log(error.message);
    });

}
socket.on('NEW_POST', (newPost) => {
    console.log(newPost)
    let tweets = newPost;
    document.getElementById('posts').innerHTML += tweetsBox(tweets.name, tweets.email,
        tweets.profilePic, tweets.tweetImg,
        new Date(tweets.createdOn).toLocaleTimeString(), tweets.tweets)

    document.getElementById('userPosts').innerHTML += tweetsBox(tweets.name, tweets.email,
        tweets.profilePic, tweets.tweetImg,
        new Date(tweets.createdOn).toLocaleTimeString(), tweets.tweets)

})

//forget password request step1 using axios
function forgetPassword() {
    let email = document.getElementById('fEmail').value;
    localStorage.setItem('email', email)
    axios({
        method: 'post',
        url: url + '/forget-password',
        data: {
            email: email,
        },
        withCredentials: true
    }).then((response) => {
        if (response.data.status === 200) {
            alert(response.data.message)
            location.href = "./forget2.html"
        }
        else {
            alert(response.data.message)
        }
    }, (error) => {
        console.log(error);
    });
    return false
}

//forget password request step2 using axios
function forgetPassword2() {
    let getEmail = localStorage.getItem('email')
    axios({
        method: 'post',
        url: url + '/forget-password-2',
        data: {
            email: getEmail,
            newPassword: document.getElementById('newPassword').value,
            otp: document.getElementById('otp').value,
        },
        withCredentials: true
    }).then((response) => {
        if (response.data.status === 200) {
            alert(response.data.message)
            location.href = "./login.html"
        }
        else {
            alert(response.data.message)
        }
    }, (error) => {
        console.log(error);
    });
    return false
}

//profile logout request using axios
function logout() {
    axios({
        method: 'post',
        url: url + '/logout',
    }).then((response) => {
        location.href = "./login.html"
    }, (error) => {
        console.log(error);
    });
    return false
}

//display homepage using display none or block property
document.getElementById('profile').style.display = "none"
function showHome() {
    document.getElementById('profile').style.display = "none"
    document.getElementById('home').style.display = "block"

}

//display profile page using display none or block property
function showProfile() {
    document.getElementById('home').style.display = "none"
    document.getElementById('profile').style.display = "block"
}

function showUsers() {
    document.getElementById('home').style.display = "none"
    document.getElementById('profile').style.display = "none"

}
function upload() {

    var fileInput = document.getElementById("fileToUpload");

    console.log("fileInput: ", fileInput);
    console.log("fileInput: ", fileInput.files[0]);
    // document.getElementById('profilePic').style.backgroundImage = `url(${fileInput.files[0]})`;

    let formData = new FormData();
    formData.append("myFile", fileInput.files[0]);
    formData.append("email", sessionStorage.getItem('email'));

    axios({
        method: 'post',
        url: url + "/upload",
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
        .then(res => {
            var userData = res
            // userData = JSON.parse(userData)
            console.log("response data=> ", res.data);
            // var jsonParse = JSON.parse(userData)
            console.log(`upload Success` + userData.toString());
            // localStorage.setItem('aja', JSON.stringify(res))   
            document.getElementById("profilePic").style.backgroundImage = `url(${res.data.url})`
        })
        .catch(err => {
            console.log(err);
        })
    return false;

}
function previewFile() {
    const preview = document.getElementById('profilePic').style.backgroundImage;
    console.log(preview)
    const file = document.querySelector('input[type=file]').files[0];
    const reader = new FileReader();

    reader.addEventListener("load", function () {
        // convert image file to base64 string
        preview.url = reader.result;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
}
