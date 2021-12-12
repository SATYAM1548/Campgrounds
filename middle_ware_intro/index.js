const express = require('express');
const app = express();
const morgan = require('morgan');


app.use(morgan('tiny'));

app.use((req, res, next) => {
    req.requestTime = Date.now();
    console.log(req.method, req.path)
    next();
})

app.use('/dome', (req, res, next) => {
    console.log("hello i am here")
    next();
})


const verifypassword = (req, res, next) => {
    const { password } = req.query;
    if (password === 'sam') {
        next();
    }
    res.send("SORRY YOU NEED A PASSWORD");
}

// app.use((req, res, next) => {
//     console.log("this is first middleware");
//     next();
//     console.log("this is called after executing second middleware")
// })
// app.use((req, res, next) => {
//     console.log("this is my second middleware");
//     next();
// })



app.get('/', (req, res) => {
    console.log(`REQUEST TIME:${req.requestTime}`)
    res.send('hello');
})

app.get('/dome', (req, res) => {
    res.send('hi');
})

app.get('/secret', verifypassword, (req, res) => {
    res.send("My joke is : I AM DUMB");
})

app.use((req, res, next) => {
    res.status(404).send('NOT FOUND')
})

app.listen(8080, () => {
    console.log('listening on port 3000');
})


