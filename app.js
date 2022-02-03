const axios = require('axios');
const express = require('express');
const ExpressError = require('./expressError');
const app = express();

const BASE_URL = 'https://api.hatchways.io/assessment/blog/posts';

app.get('/api/ping', (req, res, next) => {
    return res.json({
        success: true
    });
});

app.get('/api/posts', async (req, res, next) => {
    try {
        // Get and store query parameters
        let { tags, sortBy, direction } = req.query;

        // Build array of requests based on number of tags. Each request will be made concurrently using axios
        const requests = [];

        // Store all posts from multiple queries, including duplicates
        const aggregateData = [];

        // Check if tag parameter is provided. If there is a tag(s) provided, add each one to our requests array. If not, throw an error
        if (tags) {

            // split the query string to separate multiple tags
            tags = tags.split(",");

            // For each tag, add the parameter to the base url and add to requests array
            tags.forEach(t => {
                requests.push(`${BASE_URL}?tag=${t}`);
            });
        } else {
            // Throw error with message and status code if no tag provided
            throw new ExpressError("Tags parameter is required", 400);
        };

        // Check if sortBy parameter is provided. If it is, check that it matches an acceptable field. Otherwise, throw an error.
        if (sortBy) {
            const validParameters = ["id", "reads", "likes", "popularity"];
            if (!validParameters.includes(sortBy)) {
                throw new ExpressError("sortBy parameter is invalid", 400);
            };
        };

        // Check if direction parameter is provided. If it is, check that it matches an acceptable field. Otherwise, throw an error.
        if (direction) {
            if (direction !== "asc" && direction !== "desc") {
                throw new ExpressError("direction parameter is invalid", 400);
            };
        };

        // Make all of our requests concurrently
        await axios.all(requests.map(async r => {
            const resp = await axios.get(r);

            // Add each post from the posts array into our aggregate data.
            resp.data.posts.forEach(p => {
                aggregateData.push(p);
            });
        }));
        
        // Create a set of post ids to filter out duplicates
        const set = new Set();

        // If the post id has not been added to the set, add it now and return the post. Otherwise, do nothing (omit duplicate post).
        let posts = aggregateData.filter(p => {
            if (!set.has(p.id)) {
                set.add(p.id);
                return p;
            };
        });

        if (sortBy) {
            // If sortBy parameter is provided and there is no direction parameter provided or if the direction parameter is asc, sort by sortBy parameter in ascending order (asc is the default direction parameter). Otherwise, sort in descending order.
            posts = direction === 'asc' || !direction ?
            posts.sort((a,b) => a[sortBy] - b[sortBy]) :
            posts = posts.sort((a,b) => b[sortBy] - a[sortBy]);
        } else if (direction && !sortBy) {
            // If direction parameter is provided and no sortBy parameter is provided, sort by id (id is the default sortBy parameter) in the direction provided.
            posts = direction === 'asc' ?
            posts.sort((a,b) => a.id - b.id) :
            posts = posts.sort((a,b) => b.id - a.id);
        } else {
            // If there is no sortBy and no direction parameter provided, sort by id in ascending order (default parameters).
            posts = posts.sort((a,b) => a.id - b.id);
        };

        // Return filtered, sorted posts.
        return res.json({posts});
    } catch (error) {
        return next(error);
    };
});

// Handle errors and return message and status
app.use((err, req, res, next) => {  
    let status = err.status || 500;
    let message = err.message;

    return res.status(status).json({
        error: {message, status}
    });
});

module.exports = app;