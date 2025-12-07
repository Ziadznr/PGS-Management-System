const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['token'];

    if (!token) {
        return res.status(401).json({ status: 'unauthorized', message: 'Token missing' });
    }

    jwt.verify(token, 'SecretKey123456789', (err, decoded) => {
        if (err) {
            return res.status(401).json({ status: 'unauthorized', message: 'Invalid or expired token' });
        }

        req.user = {
            email: decoded.data.email,
            category: decoded.data.category
        };

        next();
    });
};
