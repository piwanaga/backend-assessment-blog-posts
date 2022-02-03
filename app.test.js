process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('./app');

// Test all routes:
// /api/ping
// /api/posts
describe('test all routes', () => {

    // Test ping route
    describe('GET /api/ping', () => {
        test('return success', async () => {
            const resp = await request(app).get('/api/ping')

            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual({
                success: true
            });
        });
    });

    // Test /api/posts route when no sortBy or direction parameters are provided
    describe('GET /api/posts without sortBy or direction parameters', () => {
        // If one valid tag provided, posts returned should contain that tag
        test('can handle one tag', async () => {
            const tag = 'tech';
            const resp = await request(app).get(`/api/posts?tags=${tag}`);
            const posts = resp.body.posts;
            const randomidx = Math.floor(Math.random() * posts.length);

            expect(resp.statusCode).toBe(200);
            expect(posts[randomidx].tags).toContain(tag);
        });

        // If multiple valid tags are provided, all posts returned should contain at least one of those tags.
        test('can handle multiple tags', async () => {
            const tags = ['tech', 'history'];
            const resp = await request(app).get(`/api/posts?tags=${tags[0]},${tags[1]}`);
            const posts = resp.body.posts;
            const randomidx = Math.floor(Math.random() * posts.length);

            expect(resp.statusCode).toBe(200);
            expect(posts[randomidx].tags.includes(tags[0]) || posts[randomidx].tags.includes(tags[1])).toBeTruthy
        });

        // If not sortBy or direction parameters are provided, results should be sorted by default values (id in ascending order).
        test('without additional parameters provided should be sorted by id in ascending order', async () => {
            const tag = 'tech';
            const resp = await request(app).get(`/api/posts?tags=${tag}`);
            const posts = resp.body.posts;

            // Get a first, middle and last value to compare and ensure order
            const first = posts[0].id;
            const mid = posts[Math.floor(posts.length/2)].id;
            const last = posts[posts.length-1].id;

            expect(resp.statusCode).toBe(200);

            // Results should be in ascending order
            expect(first).toBeLessThan(mid);
            expect(mid).toBeLessThan(last);
        });

        // If an invalid tag is provided, the request should be successful but not return any results.
        test('returns no posts if invalid tag', async () => {
            const tag = 'notarealtag';

            const resp = await request(app).get(`/api/posts?tags=${tag}`);

            expect(resp.statusCode).toBe(200);

            // There should be no contents in the returned posts array
            expect(resp.body.posts.length).toBe(0);
        });

        // If no tag is provided, an error should be returned
        test('throws error if no tag provided', async () => {
            const resp = await request(app).get('/api/posts');

            expect(resp.statusCode).toBe(400);
        });
    });

    // Test /api/posts route when sortBy and/or direction parameters are provided
    describe('GET /api/posts with sortBy and direction parameters', () => {

        // If sortBy parameter is provided without direction parameter, results should be sorted in ascending order
        test('can handle valid sortBy parameter', async () => {
            // tag is required for API request
            const tag = 'tech';

            // one of the valid sortBy fields
            const sortBy = 'popularity';

            const resp = await request(app).get(`/api/posts?tags=${tag}&sortBy=${sortBy}`);
            const posts = resp.body.posts;

            // Get a first, middle and last value to compare and ensure order
            const first = posts[0].popularity;
            const mid = posts[Math.floor(posts.length/2)].popularity;
            const last = posts[posts.length-1].popularity;

            expect(resp.statusCode).toBe(200);

            // Results should be in ascending order
            expect(first).toBeLessThan(mid);
            expect(mid).toBeLessThan(last);
        });

        // If sortBy parameter and direction parameter are provided, results should be sorted accordingly
        test('can handle valid sortBy and direction parameters', async () => {
            // tag is required for API request
            const tag = 'history';

            // valid sortBy and direction fields
            const sortBy = 'reads';
            const direction = 'desc';

            const resp = await request(app).get(`/api/posts?tags=${tag}&sortBy=${sortBy}&direction=${direction}`);
            const posts = resp.body.posts;

            // Get a first, middle and last value to compare and ensure order
            const first = posts[0].reads;
            const mid = posts[Math.floor(posts.length/2)].reads;
            const last = posts[posts.length-1].reads;

            expect(resp.statusCode).toBe(200);

            // Results should be in descending order
            expect(first).toBeGreaterThan(mid);
            expect(mid).toBeGreaterThan(last);
        });

        // If sortBy parameter is invalid, an error should be returned
        test('throws error if invalid sortBy parameter is invalid', async () => {
            const tag = 'politics';
            const sortBy = 'invalidparameter';
            const resp = await request(app).get(`/api/posts?tags=${tag}&sortBy=${sortBy}`);

            expect(resp.statusCode).toBe(400);
        })

        // If direction parameter is invalid, an error should be returned
        test('throws error if invalid direction parameter is invalid', async () => {
            const tag = 'politics';
            const direction = 'invalidparameter';
            const resp = await request(app).get(`/api/posts?tags=${tag}&direction=${direction}`);

            expect(resp.statusCode).toBe(400);
        })
    })
})