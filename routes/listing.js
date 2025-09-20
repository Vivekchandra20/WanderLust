const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

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
router.get("/new", isLoggedIn, (req, res) => {
  res.render("./listings/new.ejs");
});

// Show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({path:"reviews",populate:{
        path:"author",
      }})
      .populate("owner");
    if (!listing) {
      req.flash("success", "Listing you requested does not exist");
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
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing is created");
    res.redirect("/listings");
  })
);

//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/edit", { listing });
  })
);

//Update route
// ...existing code...
router.put(
  "/:id",isLoggedIn,
  validateListing,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    // If image field is missing or empty, preserve the old image object
    if (!req.body.listing.image || req.body.listing.image === "") {
      req.body.listing.image = listing.image;
    } else if (typeof req.body.listing.image === "string") {
      // If only URL is provided, update just the url property
      req.body.listing.image = {
        ...listing.image,
        url: req.body.listing.image,
      };
    }
   
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", " Listing Updated.");
    res.redirect(`/listings/${id}`);
  })
);
// ...existing code...
//Delete route
router.delete(
  "/:id",
  isOwner,
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing is deleted");
    res.redirect("/listings");
  })
);

module.exports = router;
