const app = require("../app");

const request = require("supertest");

const db = require("../db/connection");

const seed = require("../db/seeds/seed.js");

const data = require("../db/data/test-data/index.js");
const {articleData, commentData, topicData, userData} = data

beforeEach(() => {
    return seed({articleData, commentData, topicData, userData});
});

afterAll(() => {
    return db.end();
});

describe("/api/topics", () => {
    test("GET: 200 - serves an array of all topics", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then((res) => {
                const { topics } = res.body;
                expect(topics).toBeInstanceOf(Array);
                topics.forEach((topic) => {
                    expect(topic).toMatchObject({
                        slug: expect.any(String),
                        description: expect.any(String)
                    });
                });
                expect(topics.length).toBe(3);
            });
    });
    test("GET: 404 - Bad request!", () => {
        return request(app)
            .get("/api/topics/badrequest")
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("Bad request!");
            });
    });
});

describe("/api/articles", () => {
    test("GET: 200 - serves an array of all articles", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then((res) => {
                const { articles } = res.body;
                expect(articles).toBeInstanceOf(Array);
                articles.forEach((article) => {
                    expect(article).toMatchObject({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number)
                    });
                });
            });
    });
    
    test("GET: 404 - Bad request!", () => {
        return request(app)
            .get("/api/articlesbadrequest")
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("Bad request!");
            });
    });

    test("GET: 200 - can sort the articles by the specified sort_by value", () => {
        return request(app)
          .get("/api/articles?sort_by=created_at")
          .expect(200)
          .then((res) => {
            const { articles } = res.body
            expect(articles).toBeSortedBy("created_at", {descending: true});
          });
      });

    test('GET: 400 - Invalid sort query', () => {
    return request(app)
        .get('/api/articles?sort_by=created_at; DROP TABLE articles')
        .expect(400)
        .then(({body}) => {
        expect(body.msg).toBe('invalid sort query!')
        });
    });
});

describe('/api/articles/:article_id', () => {
    test('GET: 200 - get an article from the articles table by a specified article_id', () => {
        const articleID = 2
        return request(app)
            .get(`/api/articles/${articleID}`)
            .expect(200)
            .then((res) => {
                const {result} = res.body;
                expect(result).toMatchObject({
                    author: expect.any(String),
                    title: expect.any(String),
                    body: expect.any(String),
                    article_id: expect.any(Number),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number)
                });
            });
    });
    test('GET: 400 - Bad request!', () => {
        return request(app)
            .get('/api/articles/NotAnId')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("Bad request!")
            });
    });
});


describe('/api/articles/:article_id/comments', () => {
    test('GET: 200 - responds with an array of comments with the specified article_id', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then((res) => {
                expect(res.body.comments).toHaveLength(11);
                res.body.comments.forEach(comment => {
                    expect(comment).toMatchObject({
                        comment_id: expect.any(Number),
                        article_id: 1,
                        author: expect.any(String),
                        votes: expect.any(Number),
                        created_at: expect.any(String),
                        body: expect.any(String)
                    });
                })
            });
    });
    test('GET: 200 - responds with an empty array when article has no comment', () => {
        return request(app)
            .get('/api/articles/2/comments')
            .expect(200)
            .then(res => {
                expect(res.body.comments).toEqual([]);
            });
    });
    test('GET: 404 - valid but non-existent article_id', () => {
        return request(app)
            .get('/api/articles/1000/comments')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("articles not found!");
            })
    });
    test('GET: 400 - Bad request!', () => {
        return request(app)
            .get('/api/articles/NotAnId/comments')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("Bad request!")
            });
    });
});