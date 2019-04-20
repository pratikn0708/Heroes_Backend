
exports.__esModule = true;
function insertDocs(db, client,res) {
    const collection = db.collection('superheros');
   
    console.log("hi")
    // console.log(herosObj)
    collection.insertOne(herosObj).then(() => {
        console.log("inserted data successfully");
        res.send("inserted data successfully");
    }).catch(function(err){
        console.log(err);
    })
}

exports.insert = insertDocs;