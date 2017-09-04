function firstLevel(value1, i, callback) {
    let users = arr[i].users;
    let id = arr[i].id;
    let loop = Math.ceil(users / 1000);
    let limit = 0,
        offset = 0;
    for (let j = 0; j < loop; j++) {
        if (users > 1000) {
            limit = 1000;
            users -= limit;
        } else {
            limit = users;
        }
        console.log(limit + " limit " + offset + " offset");
        var start = Date.now();
        while (Date.now() < start + 100) {}
        const request = mailjet
            .get("messagesentstatistics")
            .request({
                "CampaignID": id,
                "AllMessages": true,
                "Limit": limit,
                "Offset": offset
            })
        request
            .then((result) => {
                let data = result.body.Data;
                var loop = 0;
                async.eachOfSeries(data, secondLevel, function (err) {
                    // throw the error to the highest level if there is one
                    if (!err) throw err;
            
                    // Finish the eachOfSeries if all is ok
                    callback();
                  });
                console.log("oooooo");
            })
            .catch((err) => {
                console.log(err);
            })
        offset += limit;
    }
}

function secondLevel(value2, val, callback) {
    console.log(data + " data");
    let jsonObj = data[val];
    let email = jsonObj.ToEmail;
    jsonObj['retailer'] = res[camp].retailer;
    jsonObj['summary'] = 'f';
    let tempObj = {};
    tempObj[id] = jsonObj;
    let options = {
        new: true
    };
    let campId = id;
    User.addCampaignResponse(email, campId, tempObj, options, function (err, results) {
        if (err) {
            throw err;
        } else {
            console.log("aasd");
            Campaign.updateResponse(_id, function (err, results2) {
                if (err)
                    throw err;
                else {
                    console.log("asdasaadas");
                    callback1();
                }
            }) // console.log(results);
        }
    })
}

 //
 // Start of our program
 //
 async.eachOfSeries(res, function (value, camp, callback) {
    let _id = res[camp]._id;
    let arr = res[camp].campaignID;
    async.eachOfSeries(arr, firstLevel, function (err) {
      // throw the error to the highest level if there is one
      if (!err) throw err;

      // Finish the eachOfSeries if all is ok
      callback();
    });
},
function (err) {
    if (err) {
       // Here we re done with an error
       // ...
       return;
    }
    callback(undefined, "doneeeeee");
});