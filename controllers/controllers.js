const {fetchTopics, fetchArticles, fetchArticleById, fetchCommentsByArticleId, insertComment, updateArticle} = require("../models/models");


exports.getTopics = (req, res, next) => {
    fetchTopics().then((result) => {
        res.status(200).send({topics: result });
    })
    .catch((err) => {
        next(err);
    });
};

exports.getArticles = (req, res, next) => {
    const {sort_by} = req.query;
    fetchArticles(sort_by).then(result => {
        res.status(200).send({articles: result});
    })
    .catch(err => {
        next(err);
    });
};

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params
    fetchArticleById(article_id).then(result => {
        res.status(200).send({result})
    })
    .catch(err => {
        next(err);
    });
}

exports.getCommentsByArticleId = (req, res, next) => {
    const {article_id} = req.params;
    fetchCommentsByArticleId(article_id).then(comments => {
        res.status(200).send({ comments })
    })
    .catch(err => {
        next(err);
    });
};

exports.postComment = (req, res, next) => {
    const { article_id } = req.params;
    const { body } = req;
    insertComment(article_id, body).then(newComment => {
        res.status(201).send({comment : newComment});
    })
    .catch(err => {
        next(err);
    })
};

exports.patchArticle = (req, res, next) => {
    const {article_id} = req.params;
    updateArticle(article_id, req.body).then(article => {
        res.status(201).send({article : article});
    }).catch(err => {
        next(err);
    });
};