//establish connection
// var conn = new Mongo();
// var db = conn.getDB('open311');
var db = connect('mongodb://heroku_msrgv3qd:5gr7j08immkmar76ah5as3e823@ds263710.mlab.com:63710/heroku_msrgv3qd');

//convert comments to changelogs
db.comments.find().forEach(function (comment) {

  //ensure valid comment
  if (comment.request && comment.commentator && comment.content) {

    //prepare changelog
    var changelog = {
      request: comment.request,
      comment: comment.content,
      changer: comment.commentator,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };

    //persist
    db.changelogs.insert(changelog);

  }

});
