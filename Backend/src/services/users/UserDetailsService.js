const UserDetailsService = async (Request, DataModel) => {
    try {
        const email = Request.user.email; // from middleware

        // find the user
        let data = await DataModel.findOne(
            { email: email },
            { password: 0 }       // hide password for security
        );

        if (!data) {
            return { status: "fail", data: "User not found" };
        }

        return { status: "success", data: data };

    } catch (error) {
        return { status: "fail", data: error.toString() };
    }
}

module.exports = UserDetailsService;
