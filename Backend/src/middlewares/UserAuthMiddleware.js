const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers['token'];

        if (!token) {
            return res.status(401).json({
                status: 'unauthorized',
                message: 'User token missing'
            });
        }

        jwt.verify(token, 'UserSecretKey123456789', (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    status: 'unauthorized',
                    message: 'Invalid or expired token'
                });
            }

            // Attach user info to request
            req.user = {
                email: decoded.data.email,
                role: decoded.data.role
            };

            next();
        });

    } catch (error) {
        return res.status(401).json({
            status: 'unauthorized',
            message: 'Authentication failed'
        });
    }
};
