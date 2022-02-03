# Backend Assessment - Blog Posts


## Overview
I created a backend API for retrieving blog posts from the provided external API from Hatchways. Blog posts are returned as JSON based on the following query parameters:

* Tag, ex."Tech" (required)
* SortBy, ex. "popularity" (optional)
* Direction, ex. "desc" (optional)

My API includes a ```GET``` route for ```/api/posts``` and includes error handling and tests.

## Tech Used

* Express - Set up my server
* Nodemon - Live updates to app when making changes
* Axios - API calls
* Supertest - Test API calls

## To Run Locally

* Install packages ```npm i```
* Start server ```node server.js```
* Run tests ```jest```