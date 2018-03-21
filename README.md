# Scrape news headlines into MongoDB

This is a full-stack JavaScript app built using MongoDB, Mongoose, Node.js, Express.js, Handlebars.js, HTML, and CSS. It scrapes the  [TechCrunch](https://techcrunch.com/) homepage and stores article titles and links, along with your notes and favorites, in MongoDB. The articles and notes collections reference each other through population.

https://mongo-tech-news-scraper.herokuapp.com/

![screenshot of the homepage](/public/assets/img/home-screenshot.png)

## Get new articles, save favorites, and write notes

To see updated news stories, click `Get new articles` at the top of the `Home` page. To view the full article, click the `View article on TechCrunch` link. 

When you see an article in the list that you want to mark as a favorite, click `Save article`, and read it again by clicking `Saved articles` in the top menu bar. After you have an article in your saved list, you can comment on it by clicking `Add note`.

![Add notes to a page](/public/assets/img/add-note-screenshot.png)

_Note: There is no login system, so all saved articles and comments are visible to and can be deleted by all users._

## Local set up for development purposes

These must be installed to run the app locally:

- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/get-npm)

You first need to make a local MongoDB database named `news`. Then, in a terminal window, navigate into the folder where you downloaded this app and type `npm install`. To start the app, type `node server.js` and open your browser to `localhost:3000`.

## Technology

- HTML, CSS, jQuery, Bootstrap, [Handlebars.js](https://handlebarsjs.com/)
- JavaScript
- Node.js
- MongoDB and [Mongoose](http://mongoosejs.com/)
- [Express.js](https://expressjs.com/)
- npm, including [express](https://www.npmjs.com/package/express) and [body-parser](https://www.npmjs.com/package/body-parser) packages.
- [cheerio](https://cheerio.js.org/) for scraping the website
