import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import AdminUsersList from "../../components/Users/AdminUsersList";
const AdminUsersListPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <AdminUsersList/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default AdminUsersListPage;