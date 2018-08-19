
# Astronomical Events
Using Mongo to store and then make queries on some [info](http://www.seasky.org/astronomy/astronomy-calendar-current.html) I've scraped about astronomical phenomena. The code I used to scrape the info can be found [here](https://github.com/zackstout/astronomical-calendar).

## Getting started:
You'll need to `clone` or download this repo and then uncomment the `generateDB()` function call in `server.js`. This generates the database; you need only run it once.

## Screenshot:
![screen shot 2018-08-19 at 12 29 45 am](https://user-images.githubusercontent.com/29472568/44305812-167b8780-a347-11e8-8d80-78de114ccc7e.png)

## Built with:
- MongoDB
- Mongoose
- Fast-csv
- jQuery
- Node
- Moment.js

## Hopefuls:
- [ ] Add a calendar function, so that users can save certain events to their calendar.
- [ ] Email that user with a reminder 24 hours before their saved event is about to happen.
- [ ] This requires user authentication: Passport or Django.
