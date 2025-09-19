const express= require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn}= require("../middleware.js")


const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

//Index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
  })
);

// new route
router.get(
  "/new",isLoggedIn,
  (req, res) => {
res.render("./listings/new.ejs");
  }
);

// Show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
      req.flash("success","Listing you requested does not exist");
      res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
  })
);

// CREATE listings
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New listing is created");
    res.redirect("/listings");
  })
);

//Edit route
router.get(
  "/:id/edit",isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/edit", { listing });
  })
);

//Update route
router.put(
  "/:id",
  validateListing,isLoggedIn,
  wrapAsync(async (req, res, next) => {
    
    let { id } = req.params;
    let data = req.body;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
  })
);

//Delete route
router.delete(
  "/:id",isLoggedIn,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing is deleted");
    res.redirect("/listings");
  })
);

module.exports= router;