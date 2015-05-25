An step by step live demo to explain how the Oauth2 dance works in the ORCID API and how to use the access tokens to edit an ORCID record.

#### Install NodeJS

[Install it!](https://nodejs.org/)

### Install dependencies

```
npm install gulp --save-dev
```

```
npm install gulp-ruby-sass gulp-autoprefixer gulp-minify-css gulp-uglify gulp-rename gulp-concat gulp-notify gulp-cache gulp-livereload gulp-plumber --save-dev
```

### Run web server

```
python3 -m http.server 8000

or

python -m SimpleHTTPServer 8000

```

### Run gulp

```
gulp
```

Source JavaScript and SCSS files are under /src folder, do not modify files that are in the root (/CSS and /JS)