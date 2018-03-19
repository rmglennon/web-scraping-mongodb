// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "news";
var collections = ["scrapedNews"];

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: true
}));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/news");

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Hook mongojs configuration to the db variable
var db = require("./models");

//TODO: why you no work?
// app.get("/", function(req, res) {
//   db.Article.find({})
//     .then(function(dbArticle) {
//       res.render("index", {
//         articles: dbArticle
//       });
//     });
// });

// Route for retrieving all Users from the db
app.get("/articles", function(req, res) {

  // Find all Users
  db.Article.find(
    {
      saved: false
    }
  )
    .then(function(dbArticle) {
      res.render("index", {
        articles: dbArticle
      });
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Scrape data from one site and place it into the mongodb db

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
  //res.redirect("/")
  res.render("index", {
    articles: dbArticle
  });
  //res.send("Scrape Complete");
});


// Route for retrieving all Notes from the db
app.get("/notes", function(req, res) {
  // Find all Notes
  db.Note.find({})
    .then(function(dbNote) {
      // If all Notes are successfully found, send them back to the client
      res.json(dbNote);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Route for retrieving all saved from the db
app.get("/saved", function(req, res) {
  // Find all Users
  db.Article.find({
      saved: true
    })
    .then(function(dbArticle) {
      // If all Users are successfully found, send them back to the client
      //  res.json(dbArticle);
      // var hbsArticleObject = {
      //   articles: dbArticle
      // }
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Route for retrieving all saved from the db
app.put("/saved/:id", function(req, res) {
  var query = {
    _id: req.params.id
  };
  db.Article.findByIdAndUpdate({
      query
    }, {}, {
      new: true
    })
    .then(function(dbArticle) {
      // If all Users are successfully found, send them back to the client
      //  res.json(dbArticle);
      // var hbsArticleObject = {
      //   articles: dbArticle
      // }
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Route for retrieving all saved from the db
app.delete("/saved/:id", function(req, res) {
  var query = {
    _id: req.params.id
  };
  db.Article.findByIdAndRemove({
      query
    })
    .then(function(dbArticle) {
      // If all Users are successfully found, send them back to the client
      //  res.json(dbArticle);
      // var hbsArticleObject = {
      //   articles: dbArticle
      // }
      res.render("index", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

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
    .then(function(dbArticle) {
      // If the User was updated successfully, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route to get all User's and populate them with their notes
app.get("/populateduser", function(req, res) {
  // Find all users
  db.Article.find({})
    // Specify that we want to populate the retrieved users with any associated notes
    .populate("notes")
    .then(function(dbArticle) {
      // If able to successfully find and associate all Users and Notes, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});