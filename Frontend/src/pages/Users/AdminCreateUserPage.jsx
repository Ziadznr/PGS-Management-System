import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import AdminCreateUser from "../../components/Users/AdminCreateUser";
const AdminCreateUserPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <AdminCreateUser/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default AdminCreateUserPage;