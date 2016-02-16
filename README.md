nodurl
==================
Quick and dirty Nodejs and MongoDB powered URL shortener and file-sharing app.

### Instructions
http://127.0.0.1/olympus - Administration area (default is olympus, customizable by NODURL_ADMINTAG)

Nodurl supports redirects and file downloads (aKa url shortener and file-sharing)

### Installation

* Install Nodejs and MongoDB
* git clone https://github.com/ptisp/nodurl
* npm install
* npm start

### Env variables
* NODURL_USER - admin username
* NODURL_PASSWORD - admin password
* NODURL_HOME - where to redirect when accessing /
* NODURL_PORT - listening port
* NODURL_ADMINTAG - administration area tag, default is 'olympus'
* MONGO_HOST - MongoDB host
* MONGO_DB - MongoDB database
