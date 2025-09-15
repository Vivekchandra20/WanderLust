const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: {
    filename: { type: String },
    url: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2018/05/02/17/22/beach-3369140_1280.jpg",
      set: (v) =>
        v === ""
          ? "https://cdn.pixabay.com/photo/2018/05/02/17/22/beach-3369140_1280.jpg"
          : v,
    },
  },

  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});


listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
