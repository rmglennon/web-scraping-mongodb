$(document).ready(function() {

  createPage();
  
  // load the page initially with articles
  function createPage() {
    //  $(".article-container").empty();
    //$.get("/").then(function(data) {});
    //location.window.href = '/';
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
     event.preventDefault();
    $.get("/scrape", function(data) {
      console.log(data);
        window.location.reload();
        //createPage();
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
        var noteItem;
        var noteDeleteBtn;
        for (var i = 0; i < data.notes.length; i ++) {
          noteItem = $("<li>").text(data.notes[i].body);
        //  noteItem.data("id", data.notes[i]._id);
          noteDeleteBtn = $("<button> Delete </button>").addClass("btn btn-danger delete-note-modal");
          noteDeleteBtn.attr("id", data.notes[i]._id);
          noteItem.prepend(noteDeleteBtn, " ");
          $(".notes-list").append(noteItem);
        }
      }
    );

    $("#add-note-modal").modal("toggle");
  });

  $(".note-save-btn").on("click", function(event) {

    event.preventDefault();
        var activeArticle = $(this).data();
    var newNote = {
      body: $("#note-body").val().trim()
    }
  //  console.log(newNote);
    $.ajax("/submit/" + activeArticle.id, {
      type: "POST",
      data: newNote
    }).then(
      function(data) {
      location.reload();
//console.log("notes data ", data);
      }
    );
  });

  $(".notes-list").on("click", ".delete-note-modal", function(event) {
    //console.log("delete was clicked");
    // var activeNote = $(this);
    console.log($(this).attr("id"));
    
    

    $.ajax("/notes/" + $(this).attr("id"), {
      type: "DELETE"
    }).then(
      function(data) {
        $(this).attr("id").remove();
        // use the article title from the response as the heading

        //    var test = data.notes[0].body;
        //    console.log(test);
      })
  });

});