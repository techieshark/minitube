'use strict'

/* Mini Youtube Embed server */

const express = require('express')
const compression = require('compression')
const request = require('request')
const path = require('path')
const jsdom = require('jsdom')
const fs = require('fs')
const handlebars = require('handlebars')
const url = require('url')
// experimental WHATWG URL API: easier to change params but didn't work in 7.2, does in 7.6
const URL = require('url').URL


const PORT = process.env.PORT || 5001

process.on('uncaughtException', err => console.log(`process error: ${err}`))


// open YouTube template & pass to new server
fs.readFile('youtube.hbs', function(err, data) {
  if (!err) {
    const template = handlebars.compile(data.toString());
    startServer(template);
  } else {
    // handle file read error
    return console.log(err);
  }
});

/* Extract a youtube ID from a url (string) */
function getYoutubeID(url) {
  const idIndex = url.lastIndexOf('/') + 1;
  const firstParamIndex = url.indexOf('?'); // -1 if not found

  if (firstParamIndex !== -1) {
    return url.slice(idIndex, firstParamIndex);
  } else {
    return url.slice(idIndex);
  }
}


function startServer(template) {

  const app = express()

  app.use(compression())
  app.use(express.static('public')) // static assets (CSS, etc) go in /public

  app.listen(PORT, () => console.log(`Listening on ${PORT}`))

  app.get('/youtube', (req, res) => {
    req.on('error', (err) => {
      console.error(err.stack); // maybe res.status(400) if vidUrl wrong
    });

    if (!req.query.url) {
      return res.send('Parameter required: ?url=[YouTube embed url]\n').end();
    }

    const vidUrlStr = req.query.url // should be a YouTube embed URL
    const parsedUrl = url.parse(vidUrlStr)
    if (!vidUrlStr.match(/^https?:/i) || !parsedUrl) return res.status(400).end()

    const embedAutoplayUrl = new URL(vidUrlStr)
    // console.log('user requested this page for this embed URL: ', embedAutoplayUrl.toString())
    embedAutoplayUrl.searchParams.append('autoplay', '1') // so a click triggers play
    // embedAutoplayUrl.searchParams.append('vq', 'small') // no longer works
    // console.log(embedAutoplayUrl.toString())


    // fetch title of YouTube show, then build new page and response
    jsdom.env(
      vidUrlStr,
      [],
      function (err, window) {
        const title = window.document.title;
        const youtubeID = getYoutubeID(vidUrlStr);

        // console.log(`Returning mini YouTube embed page for YouTube vid: ${youtubeID}`);
        const response = template({
          title,
          youtubeID,
          embedAutoplayUrl: embedAutoplayUrl.toString()
        });
        res.send(response);
        return;
      }
    );
  });
}


