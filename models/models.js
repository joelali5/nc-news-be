const { getArticleById } = require("../controllers/controllers");
const { query } = require("../db/connection");
const db = require("../db/connection");
const {
    checkArticlesExists,
    checkUserExists,
    checkTopicExists,
    checkCommentExists} = require("../utils/db");


exports.fetchTopics = () => {
    let query = 'SELECT * FROM topics';
    return db.query(query)
        .then((result) => {
            return result.rows;
        });  
};

exports.fetchArticles = (sort_by = "created_at", order="desc", topic) => {
    const columns = ["created_at", "title", "topic", "author", "body", "votes"];
    const validOrder = ["asc", "desc"]



    if(!columns.includes(sort_by) || !validOrder.includes(order)){
        return Promise.reject({
            status: 400,
            msg: 'invalid sort query!'
        })
    };
    let queryStr = `
            SELECT articles.*, COUNT(comments.article_id)::INT AS comment_count FROM articles
            LEFT JOIN comments ON comments.article_id = articles.article_id
        `;

    const queryValue = [];
    
    if(topic){
        queryStr += ` WHERE topic = $1`;
        queryValue.push(topic);
    }

    queryStr += ` GROUP BY comments.article_id, articles.article_id`;
    queryStr += ` ORDER BY ${sort_by} ${order}`;

    return db.query(queryStr, queryValue)
    .then(results => {
        return results.rows;
    });
};

exports.fetchArticleById = (article_id) => {
    if(!isNaN(article_id)){
        return db
            .query(`
                SELECT articles.*, COUNT(comments.article_id)::INT AS comment_count FROM articles
                LEFT JOIN comments ON comments.article_id = articles.article_id
                WHERE articles.article_id = $1
                GROUP BY comments.article_id, articles.article_id;`, [article_id])
            .then(result => {
                return result.rows[0];
            });
    }
    return Promise.reject({
        status: 400,
        msg: "Bad request!"
    })
    
};

exports.fetchCommentsByArticleId = (article_id) => {
    if(isNaN(article_id)){
        return Promise.reject({
            status: 400,
            msg: "Bad request!"
        });
    };
    return checkArticlesExists(article_id)
        .then(() => {
            return db.query(
                `   SELECT * FROM comments
                    WHERE article_id = $1;
                `,
                [article_id]
            );
        })
        .then((result) => {
            return result.rows;
        });
}

exports.insertComment = (article_id, comment) => {
    if(isNaN(article_id)){
        return Promise.reject({
            status: 400,
            msg: "Bad request!"
        });
    };
    const {username, body} = comment;
    if(!username || !body){
        return Promise.reject({
            status: 400,
            msg: "Bad request!"
        });
    };
    
    return checkArticlesExists(article_id).then(() => {
        return checkUserExists(username).then(() => {
            return db.query("INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;", [username, body, article_id])}).then(result => {
                return result.rows[0];
        })
    });
};

exports.updateArticle = (article_id, votes) => {
    const {inc_votes} = votes
    return db.query('UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;', [inc_votes, article_id]).then(result => {
        if(result.rows.length === 0){
            return Promise.reject({
                status: 404,
                msg: "Article not found!"
            })
        }
        return result.rows[0];
    });
}

exports.fetchUsers = () => {
    return db.query('SELECT * FROM users')  
        .then(results => {
            return results.rows;
        })
}

exports.deleteComment = (comment_id) => {
    if(isNaN(comment_id)){
        return Promise.reject({
            status: 400,
            msg: "Invalid Id!"
        });
    };
    return db.query(
        `
        DELETE FROM comments
        WHERE comment_id = $1 RETURNING *;
        `, [comment_id]
    ).then(result => {
        if(result.rows.length === 0){
            return Promise.reject({
                status: 404,
                msg: "Comment id not found!"
            });
        };
        return result.rows[0];
    });
};