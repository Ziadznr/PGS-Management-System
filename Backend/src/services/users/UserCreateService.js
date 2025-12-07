const bcrypt = require('bcrypt');

const UserCreateService = async (Request, DataModel) => {
    try {
        let postBody = Request.body;

        // 1. Validate category/role
        const allowedRoles = ['admin', 'teacher', 'dean', 'student'];
        if (postBody.category && !allowedRoles.includes(postBody.category)) {
            return { status: 'fail', data: "Invalid user category/role" };
        }

        // 2. Hash password
        if (postBody.password) {
            const salt = await bcrypt.genSalt(10);
            postBody.password = await bcrypt.hash(postBody.password, salt);
        }

        // 3. Check if email already exists  
        const existingUser = await DataModel.findOne({ email: postBody.email });
        if (existingUser) {
            return { status: 'fail', data: "Email already exists" };
        }

        // 4. Create user
        const data = await DataModel.create(postBody);

        return { status: 'success', data: data };

    } catch (error) {
        // Log the error to the terminal
        console.error('UserCreateService Error:', error);
        
        // Still return fail to API
        return { status: 'fail', data: error.toString() };
    }
}

module.exports = UserCreateService;
