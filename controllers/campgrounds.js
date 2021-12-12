const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res) => {
    const getData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // res.send(getData.body.features[0].geometry.coordinates);

    // if (!req.body.campground) throw new Error('Fill the properties', 400);
    const campground = new Campground(req.body.campground);
    campground.geometry = getData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    // console.log(req.user)
    await campground.save();
    req.flash('success', 'new campground made!!!!!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })

}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground })

}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const updateCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updateCampground.images.push(...imgs);
    console.log(updateCampground)
    await updateCampground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updateCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'campground updated')
    res.redirect(`/campgrounds/${updateCampground._id}`)

}
module.exports.deleteCampground = async (req, res) => {
    const deletedCampground = await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'campground deleted')
    res.redirect('/campgrounds');
}