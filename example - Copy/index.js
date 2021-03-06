const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const accountSystem = require('mysql_accountsystem')
const app = express()
const port = 80 

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
    }))

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

accountSystem.connectDatabase('localhost', 'Admin', 'egoz2007', 'testing', function(err) {
    if (err) throw err;
    console.log('connected to database successfully!')
})

app.get('/', (req, res) => {
    res.render('index', {message: ""})
})

app.get('/login', (req, res) => {
    res.render('login', {message: ""})
})

app.get('/dashboard', (req, res) => {
    if (req.session.loggedIn) {
    res.render('dashboard', {username: req.session.username})
    } else {
    res.redirect('/login', {message: 'You must be logged in to view this page!'})
    }
})


//a post request to make an account
app.post('/register', (req, res) => {
    //get username password and email from frontend
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    //get the users ip from the request
    let ip = req.headers['x-forwarded-for']
    //create a new account using the createAccount function
    accountSystem.createAccount(username, password, email, ip, 10, 8, "accounts")
    .then(message => createdSuccessfully(message))
    .catch(message => createdUnSuccessfully(message))
    //things to run if the account is created successfully
    function createdSuccessfully(message) {
        console.log(message)
        //render login page and ask the user to log in
        res.render('login', {message: 'Account created successfully! please login'})
    }
    //things to run if the account is not created successfully
    function createdUnSuccessfully(message) {
        console.log(message)
        //render index with the error message
        res.render('index', {message: message})
    }
})

//a post request to login
app.post('/login', (req, res) => {
    //get username and password from frontend
    let username = req.body.username;
    let password = req.body.password;

    //use the login function to check username and password
    accountSystem.login(username, password, "accounts")
    .then(acceptedAccount)
    .catch(unAcceptedAccount)
    //things to run if the account is accepted
    function acceptedAccount([message, username]) {
        console.log(message)
        //set session variables
        req.session.username = username
        req.session.loggedIn = true
        //render dashboard
        res.render('dashboard', {username: username})
    }
    //things to run if the account is not accepted
    function unAcceptedAccount(error) {
        console.log(error)
        //render login page with error message
        res.render('login', {message: 'Incorrect username or password!'})
    }
})

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})