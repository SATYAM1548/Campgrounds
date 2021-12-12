const path = require('path');
const mongoose = require('mongoose')
const Campground = require('../models/campground.js')
const cities = require('./cities.js');
const { places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connnection error:"));
db.once("open", () => {
    console.log("Databse connected");
});

const sample = (array) => Math.floor(Math.random() * array.length);


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const Rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const c = new Campground({
            author: "6191fc525539105213ee98e1",
            location: `${cities[Rand1000].city} ${cities[Rand1000].state}`
            , title: `${places[sample(places)]} ${descriptors[sample(descriptors)]}`
            , description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel aut qui, omnis sit ea corporis voluptate nesciunt maxime quis nisi pariatur temporibus, cum vitae necessitatibus eum distinctio earum voluptatum. Eum.'
            , price
            , geometry: {
                type: "Point",
                coordinates: [cities[Rand1000].longitude, cities[Rand1000].latitude]
            }
            , images: [{
                url: 'https://res.cloudinary.com/dku3hwb9c/image/upload/v1637516734/YelpCamp/c1ohs18x5hsk7jsehxht.jpg',
                filename: 'YelpCamp/c1ohs18x5hsk7jsehxht',

            },
            {
                url: 'https://res.cloudinary.com/dku3hwb9c/image/upload/v1637516733/YelpCamp/zwmhgvn7zjxnhhy45bqs.jpg',
                filename: 'YelpCamp/zwmhgvn7zjxnhhy45bqs'
            },
            {
                url: 'https://res.cloudinary.com/dku3hwb9c/image/upload/v1637516735/YelpCamp/tvs65hz0h3vioebrokct.jpg',
                filename: 'YelpCamp/tvs65hz0h3vioebrokct',
            }
            ]
        });
        await c.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})