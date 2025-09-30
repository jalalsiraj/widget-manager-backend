
const to = (promise) => {
    return promise
        .then((data) => {
            return [null, data];
        })
        .catch((err) => {
            return [err, null];
        });
};

const ReS = (res, data, statusCode) => {
    let responseData = { success: true, status: statusCode, data };
    return res.status(statusCode).json(responseData);
}

const ReE = (res, error, statusCode) => {
    let responseData = { success: false, status: statusCode, error }
    return res.status(statusCode).json(responseData);
}

const TE = (message, log = false) => {
    if (log) {
        console.error(message);
    }
    return new Error(message);
}

module.exports = { ReE, ReS, to, TE }