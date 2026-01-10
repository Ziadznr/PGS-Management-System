// utility/CreateUserToken.js
const jwt = require("jsonwebtoken");

const CreateUserToken = (data) => {
    return jwt.sign(
        { data },
        'UserSecretKey123456789',
        { expiresIn: '24h' }
    );
};

module.exports = CreateUserToken;
