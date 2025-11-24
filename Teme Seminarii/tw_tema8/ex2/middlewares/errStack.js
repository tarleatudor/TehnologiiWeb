function errorStack(err, req, res, next) {
    console.error("Error stack trace:");
    console.error(err.stack);
    next(err);
}

module.exports = errorStack;