
const express = require('express');
const app = express();
const port = process.env.PORT || 1745;
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('fast-csv');
const db = require('./models');
const mongoose = require('mongoose');
let databaseUrl = '';
const moment = require('moment');
const cron = require("node-cron");
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD
  },
});

cron.schedule("0 8 * * *", () => {
  setReminders();
});

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let allCsvs = [];
for (let i=2014; i < 2031; i++) {
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

// ================================================================================================================

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

// ================================================================================================================

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

// a POST request, really:
app.get('/remind', (req, res) => {
  db.Astro.find({ "_id": req.query.id })
  .then(data => {
    data[0].remind = true;
    data[0].save(err => {
      // console.log(err);
      // console.log("reminding for...", data);

      // setReminders();
    });

  });
});




// maybe ....the best way might be to have a bash script that runs this every day.
// We want a 24-hour reminder and a 48-hour reminder, methinks.
function setReminders() {
  db.Astro.find({ "remind": true })
  .then(data => {
    // console.log("data now be...", data);
    const current = moment().format('x');

    data.forEach(d => {
      const diff = d.timestamp - current;
      console.log("diff is...", diff);

      // Send 24-hour notice:
      if (diff < 24 * 60 * 60 * 1000) {

        const mailOptions = {
          from: 'zackstout@gmail.com',
          to: 'zackstout@gmail.com',
          subject: `Astro (24-hour) Reminder for ${d.type}`,
          html: `Ahoy! <p>On ${d.date}, we should have a gorgeous ${d.type}! Enjoy yourself!`
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

      }
      // Send 48-hour notice:
      else if (diff < 48 * 60 * 60 * 1000) {

        const mailOptions = {
          from: 'zackstout@gmail.com',
          to: 'zackstout@gmail.com',
          subject: `Astro (48-hour) Reminder for ${d.type}`,
          html: `Ahoy! <p>On ${d.date}, we should have a gorgeous ${d.type}! Enjoy yourself!`
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }
    });
  });
}


setReminders();


app.listen(port, function (req, res) {
  console.log('Listening on port', port);
});
