module.exports = (allowedRoles = []) => {
    return (req, res, next) => {

        if (!req.user || !req.user.role) {
            return res.status(403).json({
                status: 'forbidden',
                message: 'Access denied'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'forbidden',
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};
