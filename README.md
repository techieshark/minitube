# MiniTube.

A YouTube embed minifier.


## Deployment:

* Download [Heroku toolbelt](https://toolbelt.heroku.com): 

* Login to Heroku, create new app, & deploy:
  
  ```
  heroku login
  heroku create
  git push heroku master
  ```

# Local Dev

Run server:
```
npm start
```

Open an existing YouTube embed URL, like this in your browser
```
localhost:5001/youtube?url=https://www.youtube.com/embed/C4Uc-cztsJo
```

You should see a YouTube embed that has a much smaller network size
than actual YouTube embeds.