// Parses our HTML and helps us find elements
var cheerio = require("cheerio");
// Makes HTTP request for HTML page
var request = require("request");

// First, tell the console what server.js is doing

request("https://techcrunch.com/", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var results = [];

  // With cheerio, find each p-tag with the "title" class
  // (i: iterator. element: the current element)
  $("div.post-block").each(function(i, element) {
    // Save the text and href of each link enclosed in the current element
    
    // use find to traverse all elements and children for the direct
    // trim() removes whitespace because the items return \n and \t before and after the text
    var title = $(element).find("a.post-block__title__link").text().trim();
    var link = $(element).find("a.post-block__title__link").attr("href");
    var intro = $(element).children(".post-block__content").text().trim();
      
      results.push({
        title: title, // title has \n\t\t\t\t  and \t\t\t
        link: link,
        intro: intro // has \n\t\t and \t
    });
  });
  


  // Log the results once you've looped through each of the elements found with cheerio
  console.log(results);
});