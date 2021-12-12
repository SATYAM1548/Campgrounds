if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override')
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilis/ExpressError');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');


const userRoutes = require('./routes/user')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');
const { isLoggedIn, isReviewAuthor } = require('./middleware');
const Campground = require('./models/campground');
const catchAsync = require('./utilis/catchAsync');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connnection error:"));
db.once("open", () => {
    console.log("Databse connected");
});

const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionconfig = {
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionconfig))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());


passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

// app.delete('/campgrounds/:id/reviews/reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     req.flash('success', 'Successfully deleted review')
//     res.redirect(`/campgrounds/${id}`);
// }))

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = "something went wrong"
    res.status(statusCode).render('error', { err });
})


app.listen(5000, () => {
    console.log('listening on port 5000');
})


