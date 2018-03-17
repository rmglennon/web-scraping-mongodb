// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var handlebars = require("express-handlebars");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "news";
var collections = ["scrapedNews"];

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/populatedb2", {
  useMongoClient: true
});

// Hook mongojs configuration to the db variable
var db = require("./models");
db.on("error", function(error) {
  console.log("Database Error:", error);
});


// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
  request("https://techcrunch.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $("div.post-block").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      
      // use find to traverse all elements and children for the direct
      // trim() removes whitespace because the items return \n and \t before and after the text
      var title = $(element).find("a.post-block__title__link").text().trim();
      var link = $(element).find("a.post-block__title__link").attr("href");
      var intro = $(element).children(".post-block__content").text().trim();
      // If this found element had both a title and a link
      if (title && link && intro) {
        // Insert the data in the scrapedData db
        db.scrapedNews.insert({
          title: title,
          link: link,
          intro: intro
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
