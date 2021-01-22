var url = "http://localhost:5000"
// var url = "https://realtime-twitt1er-jahanzaib.herokuapp.com"
//user signup request using axios

var socket = io(url);
socket.on('connect', function () {
    console.log("connected")
});

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
            document.getElementById('profilePic').style.backgroundImage = `url(${src})`;
            sessionStorage.setItem('email', response.data.profile.email)
    }, (error) => {
        location.href = "./login.html"
    });
    return false
}

//user tweet or post request using axios
function post() {
    axios({
        method: 'post',
        url: url + '/tweet',
        credentials: 'include',
        data: {
            tweet: document.getElementById('tweet').value,
        },
    }).then((response) => {
        console.log(response);
        if (response.data.data.profilePic) {
            document.getElementById('userPosts').innerHTML += `
            <div class="posts row">
            <div class="col-md-2">
                <img src="${response.data.data.profilePic}" alt="" style="width:50px; border-radius: 100%">
            </div>
            <div class="col-md-10">
                <span>${response.data.data.name}</span>
                <span class="text-primary">${new Date(response.data.data.createdOn).toLocaleTimeString()}</p>
                <p>${response.data.data.tweets}</p>
            </div>
            </div>
        `            
        }
        else{
            document.getElementById('userPosts').innerHTML += `
            <div class="posts row">
            <div class="col-md-2">
                <img src="${'./fallback.png'}" alt="" style="width:50px; border-radius: 100%">
            </div>
            <div class="col-md-10">
                <span>${response.data.data.name}</span>
                <span class="text-primary">${new Date(response.data.data.createdOn).toLocaleTimeString()}</p>
                <p>${response.data.data.tweets}</p>
            </div>
            </div>
        `   
        }


    }, (error) => {
        console.log(error.message);
    });
    document.getElementById('tweet').value = "";
    return false
}

//get all user post or tweet request using axios
function getTweets() {
    axios({
        method: 'get',
        url: url + '/getTweets',
        credentials: 'include',
    }).then((response) => {
        console.log(response.data.data.profilePic)
        let tweets = response.data.data;
        let html = ""
        tweets.forEach(element => {
            if (element.profilePic) {
                html += `                <div class="posts row">
                <div class="col-md-2">
                    <img src="${element.profilePic}" alt="" style="width: 50px; border-radius: 100%; ">
                </div>
                <div class="col-md-10">
                    <span>${element.name}</span>
                    <span class="text-primary">${new Date(element.createdOn).toLocaleTimeString()}</span>
                    <p>${element.tweets}</p>
                </div>
                </div>
                `                
            }
            else{
                html += `                <div class="posts row">
                <div class="col-md-2">
                    <img src="${'./fallback.png'}" alt="" style="width: 50px; border-radius: 100%; ">
                </div>
                <div class="col-md-10">
                    <span>${element.name}</span>
                    <span class="text-primary">${new Date(element.createdOn).toLocaleTimeString()}</span>
                    <p>${element.tweets}</p>
                </div>
                </div>
                `
            }

        });
        document.getElementById('posts').innerHTML = html;

        let userTweet = response.data.data
        let userHtml = ""
        let userName = document.getElementById('pName').innerHTML;
        userTweet.forEach(element => {
            if (element.name == userName) {
                userHtml += `
                <div class="posts row">
        <div class="col-md-2">
            <img src="${element.profilePic}" alt="" style="width: 50px; border-radius: 100%; ">
        </div>
        <div class="col-md-10">
            <span>${element.name}</span>
            <span class="text-primary">${new Date(element.createdOn).toLocaleTimeString()}</span>
            <p>${element.tweets}</p>
        </div>
        </div>`
            }
        });
        document.getElementById('userPosts').innerHTML = userHtml;
    }, (error) => {
        console.log(error.message);
    });
    return false
}
socket.on('NEW_POST', (newPost) => {
    console.log(newPost)
    let tweets = newPost;
    document.getElementById('posts').innerHTML += `
    <div class="posts row">
        <div class="col-md-2">
            <img src="${tweets.profilePic}" alt="" style="width: 50px; border-radius: 100%; ">
        </div>
        <div class="col-md-10">
            <span>${tweets.name}</span>
            <span class="text-primary">${new Date(tweets.createdOn).toLocaleTimeString()}</span>
            <p>${tweets.tweets}</p>
        </div>
        </div>
    `

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
            // var jsonParse = JSON.parse(userData)
            console.log(`upload Success` + userData.toString());
            // localStorage.setItem('aja', JSON.stringify(res))            
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
