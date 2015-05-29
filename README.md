An step by step live demo to explain how the Oauth2 dance works in the ORCID API and how to use the access tokens to edit an ORCID record.

#### Install NodeJS

[Install it!](https://nodejs.org/)

### Install Gulp

```
sudo npm install --global gulp 
```

### Install dependencies

```
npm install 
```

### Run gulp, includes express web server

```
gulp
```

Source JavaScript and SCSS files are under /src folder, do not modify files that are in (/public/css and /public/js)

### Production minimize mode
The default view doesn't reference minimized js and css to make development easier. To enable css and javascript minimization 
for production set the `MINIMIZE` environment variable to `true`;

```
export MINIMIZE=true
```
