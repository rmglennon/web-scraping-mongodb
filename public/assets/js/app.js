$(document).ready(function() {

  createPage();

  // load the page initially with articles
  function createPage() {
    //  $(".article-container").empty();
    $.get("/articles").then(function(data) {
      console.log("the page is drawn!");
    });
  };

  // when the save button is clicked, get the article ID and set its saved property to true
  $(".save-btn").on("click", function(event) {

    var newSavedArticle = $(this).data();
    newSavedArticle.saved = true;
    console.log("saved was clicked");
    $.ajax("/saved/" + newSavedArticle.id, {
      type: "PUT",
      data: newSavedArticle
    }).then(
      function(data) {
        location.reload();
      }
    );
  });

  $(".scrape-new").on("click", function(event) {
    // event.preventDefault();
    $.get("/scrape").then(
      function(data) {
        createPage();
      }
    );
  });

  // when the button to removed a saved article from the saved list, get the article ID and set its saved property back to false
  $(".unsave-btn").on("click", function(event) {
    var newUnsavedArticle = $(this).data();
    newUnsavedArticle.saved = false;
    $.ajax("/saved/" + newUnsavedArticle.id, {
      type: "PUT",
      data: newUnsavedArticle
    }).then(
      function(data) {
        location.reload();
      }
    );
  });

  // when the add note button is clicked on the saved articles page, show a modal and save the note into the note collection
  $(".note-modal-btn").on("click", function(event) {
    var activeArticle = $(this).data();
    $.get("/notes/" + activeArticle.id).then(
      function(data) {
        //location.reload();
        console.log(data);
        // use the article title from the response as the heading
        var modalText = data.title;
        $("#note-modal-title").text("Notes for article: " + data.title);
      }
    );

    $("#add-note-modal").modal("toggle");
  });

  $(".note-save-btn").on("click", function(event) {

    event.preventDefault();
    var newNote = {
      body: $("#note-body").val().trim()
    }
    console.log(newNote);
    $.ajax("/submit", {
      type: "POST",
      data: newNote
    }).then(
      function(data) {
      location.reload();
console.log("notes data ", data);
      }
    );
  });

});