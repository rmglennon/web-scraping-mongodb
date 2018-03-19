$(document).ready(function() {

  createPage();

  function createPage() {
    // Empty the article container, run an AJAX request for any unsaved headlines
    //  $(".article-container").empty();
    $.get("/articles").then(function(data) {
      // If we have headlines, render them to the page
      console.log("the page is drawn!");
    });
  }

  $(".save-btn").on("click", function(event) {

    var id = $(this).data("id");
    var newSavedArticle = {
      saved: true
    };
    console.log("I was clicked");
    $.ajax("/articles" + id, {
      type: "PUT",
      data: newSavedArticle
    }).then(
      function(data) {
        // location.reload();
        createPage();
      }
    );
  });

  $(".scrape-new").on("click", function(event) {
    event.preventDefault();

    console.log("I was clicked");
    $.get("/scrape").then(
      function(data) {
        createPage();
      }
    );
  });

  //$.get("/api/headlines?saved=false").then(function(data) 

  $(".unsave-btn").on("click", function(event) {

        var id = $(this).data("id");

    console.log("I was clicked");
    $.ajax("/articles/id", {
      type: "DELETE",
      data: newSavedArticle
    }).then(
      function() {
        // location.reload();
        console.log("I was clicked 2");
      }
    );
  });

  $(".note-modal-btn").on("click", function(event) {

    // var id = $(this).("_id");

    console.log("I was clicked");
    $.ajax("/submit", {
      type: "PUT",
      data: newSavedArticle
    }).then(
      function() {
        // location.reload();
        console.log("I was clicked 2");
      }
    );
  });

  $(".note-save-btn").on("click", function(event) {

    // var id = $(this).("_id");

    console.log("I was clicked");
    $.ajax("/submit", {
      type: "POST"
    }).then(
      function() {
        // location.reload();
        console.log("I was clicked 2");
      }
    );
  });

});