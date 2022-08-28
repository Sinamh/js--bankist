const path = require('path');

const notFound = (req, res) => {
    res.redirect('/pages/not-found.html');
    // res.sendFile(path.join(__dirname, '/pages/not-found.html'));
    // res.status(404).send('Route does not exist');
}

module.exports = notFound