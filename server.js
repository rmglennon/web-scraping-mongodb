// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "news";
var collections = ["scrapedNews"];

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json({
  type: "application/json"
}));
// serve the public directory
app.use(express.static("public"));

// use promises with Mongo and connect to the database
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/news");

// use handlebars
app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Hook mongojs configuration to the db variable
var db = require("./models");

// get all articles from the database (that are not saved)
app.get("/", function(req, res) {

  db.Article.find({
      saved: false
    },

    function(error, dbArticle) {
      if (error) {
        console.log(error);
      } else {
        res.render("index", {
          articles: dbArticle
        });
      }
    })
})

// use cheerio to scrape stories from TechCrunch and store them
app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
  request("https://techcrunch.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    $("div.post-block").each(function(i, element) {

      // trim() removes whitespace because the items return \n and \t before and after the text
      var title = $(element).find("a.post-block__title__link").text().trim();
      var link = $(element).find("a.post-block__title__link").attr("href");
      var intro = $(element).children(".post-block__content").text().trim();

      if (title && link && intro) {
        // Insert the data
        db.Article.create({
            title: title,
            link: link,
            intro: intro
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            } else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          });
      }
    });

  });
  res.redirect("/")
});

// Route for retrieving all saved from the db
app.get("/saved", function(req, res) {
  // Find all saved articles
  db.Article.find({
      saved: true
    })
    .then(function(dbArticle) {
      // If all saved articles are successfully found, send them back to the client
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    })
  
});

// Route adding notes 
app.put("/saved/:id", function(req, res) {
  db.Article.findByIdAndUpdate(
      req.params.id, {
        $set: req.body
      }, {
        new: true
      })
    .then(function(dbArticle) {
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Route for saving a new Note to the db and associating it with an article
app.post("/submit/:id", function(req, res) {
  // Create a new Note in the db
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        $push: {
          notes: dbNote._id
        }
      }, {
        new: true
      });
    })
    .then(function(dbNote) {
      console.log("submit ", dbNote.body);

      res.json(dbNote.body);

    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route to get all notes by ID
app.get("/notes/:id", function(req, res) {
  db.Article.findById(
      req.params.id)
    .populate("notes")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});


app.delete("/notes/:id", function(req, res) {

  db.Note.findByIdAndRemove(req.params.id)
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});