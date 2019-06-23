open311-api
===========

[![Build Status](https://travis-ci.org/anzalab/open311-api.svg?branch=develop)](https://travis-ci.org/anzalab/open311-api)
[![Dependencies Status](https://david-dm.org/anzalab/open311-api/status.svg?style=flat-square)](https://david-dm.org/anzalab/open311-api)

open311-api is partial implementation of [open311 GeoReport v2](http://wiki.open311.org/GeoReport_v2/) with extension for [issue tracking](https://en.wikipedia.org/wiki/Issue_tracking_system).

## About

## Requirements

### System Requirements
- CPU - 1+ gigahertz
- RAM - 512+ megabytes
- HDD - 1+ gigabyte

### Software Requirements
- Ubuntu Server 16.04+
- NodeJS 7.2.1+
- MongoDB 3.4.1+
- Redis Server 3.2.6+


## Testing

* Clone this repository

* Install all development dependencies

```sh
$ npm install
```
* Then run test

```sh
$ npm test
```

## References
- [GeoReport_v2](http://wiki.open311.org/GeoReport_v2/)
- [jsonapi](http://jsonapi.org/)
- [Oauth2](https://oauth.net/2/)
- [2dsphere](https://docs.mongodb.com/manual/core/2dsphere/)
- [geojson](https://docs.mongodb.com/manual/reference/geojson/)
- [geojson-second-bite](http://www.macwright.org/2015/03/23/geojson-second-bite.html)
- [introduction-to-mongodb-geospatial](http://tugdualgrall.blogspot.com/2014/08/introduction-to-mongodb-geospatial.html)
- [create-an-auto-incrementing-field](https://docs.mongodb.com/v3.0/tutorial/create-an-auto-incrementing-field/)
- [http://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-facet](http://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-facet)


## Contribute

Fork this repo and push in your ideas. 
Do not forget to add a bit of test(s) of what value you adding.

## License

The MIT License (MIT)

Copyright (c) 2016 lykmapipo, CodeTanzania & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
