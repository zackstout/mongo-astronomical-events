
var express = require('express');
var app = express();
var port = process.env.PORT || 1745;
var bodyParser = require('body-parser');
var fs = require('fs');
var csv = require('fast-csv');
var db = require('./models');
var mongoose = require('mongoose');
var databaseUrl = '';
const moment = require('moment');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var allCsvs = [];
for (var i=2014; i < 2031; i++) {
  allCsvs.push(String(i));
}

app.use(bodyParser.json());
// Needed this!!!:
app.use(bodyParser.urlencoded({
  extended: true
}));

// Can't have a slash here:
app.use(express.static('public'));

// NOTE: You do NOT have to create the database manually -- mongo handles it:
if (process.env.MONGODB_URI) {
    databaseUrl = process.env.MONGODB_URI;
} else {
    databaseUrl = 'mongodb://localhost:27017/astro';
}

mongoose.connection.on('connected', function() {
  console.log('we in!');
});

mongoose.connection.on('error', function() {
  console.log("aw nuts bro");
});

//initiate connection:
mongoose.connect(databaseUrl);

// I'm falling in love with this:
function generateDB() {
  allCsvs.forEach(file => {
      var stream = fs.createReadStream(`csvs/${file}.csv`);

      var csvStream = csv()
      // This fires for every row in the csv:
      .on("data", function(data){
        const year = parseInt(file);
        const month = months.indexOf(data[0].slice(0, data[0].indexOf(' '))) + 1;
        const day = parseInt(data[0].slice(data[0].indexOf(' ') + 1));
        let new_month = month.toString();
        while (new_month.length < 2) {
          new_month = '0' + new_month;
        }
        const full_date = `${new_month}-${day}-${year}`;
        const moment_date = moment(full_date, 'MM-DD-YYYY').format('x');

        // Create the Astro document:
        db.Astro.create({
          date: data[0] + ' ' + file,
          type: data[1],
          desc: data[2],
          year: year,
          month: month,
          day: day,
          timestamp: moment_date
        })
        .then(astro => {
          console.log(astro);
        })
        .catch(err => {
          console.log(err.message);
        });
      })
      .on("end", function(){
        console.log("done");
      });

      stream.pipe(csvStream);
    });
}

// generateDB();

// db.Astro.find({"date" : {$regex: ".*2014.*"}})
//   .then(res => console.log(res))
//   .catch(err => console.log(err));

app.get('/astro', (req, res) => {
  db.Astro.find({"date" : {$regex: `.*${req.query.year}.*`}, "type" : {$regex: `.*${req.query.search}.*`}})
    .sort({"year" : 1, "month" : 1, "day": 1})
    .then(data => {
      // console.log(data);
      res.json(data);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/fromnow', (req, res) => {

  const current = moment().format('x');
  console.log(current, req.query.type);

  db.Astro.find({"type" : {$regex: `.*${req.query.type}.*`}, "timestamp": {$gt: current}})
    .sort({"year" : 1, "month" : 1, "day": 1})
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log(err);
    });
});


app.listen(port, function (req, res) {
  console.log('Listening on port', port);
});
