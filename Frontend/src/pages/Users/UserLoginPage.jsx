import React, { Fragment, lazy, Suspense } from 'react';
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const UserLogin = lazy(() => import('../../components/Users/UserLogin'));

const UserLoginPage = () => {
    return (
        <Fragment>
            <Suspense fallback={<LazyLoader />}>
                <UserLogin />
            </Suspense>
        </Fragment>
    );
};

export default UserLoginPage;
