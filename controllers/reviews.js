const Campground = require('../models/campground')
const Review = require('../models/review.js')

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    // console.log(review.author)
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'successfully posted !')
    res.redirect(`/campgrounds/${req.params.id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}
