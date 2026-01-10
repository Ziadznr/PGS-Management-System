import React, { Fragment, lazy, Suspense } from 'react';
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const UserRegistration = lazy(() => import('../../components/Users/UserRegistration'));

const UserRegistrationPage = () => {
    return (
        <Fragment>
            <Suspense fallback={<LazyLoader />}>
                <UserRegistration />
            </Suspense>
        </Fragment>
    );
};

export default UserRegistrationPage;
