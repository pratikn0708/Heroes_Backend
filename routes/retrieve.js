exports.__esModule = true;
function RetrieveDocs(db,res){
    const collection = db.collection('superheros');
  
    collection.find({}).toArray().then((result) => {
      res.send(result);
    }).catch(function(err){
      console.log(err);
    })
}
exports.retrieve = RetrieveDocs;