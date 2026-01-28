import React, { Fragment, Suspense, lazy } from 'react';
import UserLayout from "../../components/Users/UserLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const DeanUsersList = lazy(() => import('../../components/Dean/DeanUsersList'));

const DeanUsersListPage = () => {
    return (
        <Fragment>
            <UserLayout>
                <Suspense fallback={<LazyLoader />}>    
                    <DeanUsersList />
                </Suspense>
            </UserLayout>
        </Fragment>
    );
};

export default DeanUsersListPage;