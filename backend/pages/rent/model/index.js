module.exports = function(req, callback) {
    req.model = Object.assign({}, req.model);
    callback();
};