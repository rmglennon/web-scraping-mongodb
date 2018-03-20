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

  // sort by descending ID so newest are on top
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
    // For each element with a "title" class
    $("div.post-block").each(function(i, element) {

      // use find to traverse all elements and children for the direct
      // trim() removes whitespace because the items return \n and \t before and after the text
      var title = $(element).find("a.post-block__title__link").text().trim();
      var link = $(element).find("a.post-block__title__link").attr("href");
      var intro = $(element).children(".post-block__content").text().trim();

      if (title && link && intro) {
        // Insert the data in the scrapedData db
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
  // Send a "Scrape Complete" message to the browser
  res.redirect("/")
  //res.send("Scrape Complete");
});

// Route for retrieving all saved from the db
app.get("/saved", function(req, res) {
  // Find all Users
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

// Route for retrieving all saved from the db and deleting them
// app.delete("/saved/:id", function(req, res) {
//   var query = {
//     _id: req.params.id
//   };
//   db.Article.findByIdAndRemove({
//       query
//     })
//     .then(function(dbArticle) {
//       res.render("index", {
//         articles: dbArticle
//       })
//     })
//     .catch(function(err) {
//       // If an error occurs, send the error back to the client
//       res.json(err);
//     });
// });

// Route for saving a new Note to the db and associating it with a User
app.post("/submit", function(req, res) {
  // Create a new Note in the db
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({}, {
        $push: {
          notes: dbNote._id
        }
      }, {
        new: true
      });
    })
    .then(function(dbNote) {
      // If the User was updated successfully, send it back to the client
      console.log("submit ", dbNote.body);
      // where .body represents the body field from the collection
      res.json(dbNote.body);

    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route to get all notes by ID
app.get("/notes/:id", function(req, res) {
  // Find all users
  db.Article.findById(
      req.params.id)
    // Specify that we want to populate the retrieved users with any associated notes

    .populate("notes")
    .then(function(dbArticle) {
      // If able to successfully find and associate all Users and Notes, send them back to the client
      //console.log(dbArticle.notes);
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

app.get("/notes/:id", function(req, res) {

  db.Note.findByIdAndRemove(req.params.id), function (error, data) {
        if (error) {
            console.log(error);
        } else {
            console.log("Deleted note");
        }
        res.send(data);
    };
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});