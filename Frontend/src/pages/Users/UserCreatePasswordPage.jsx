import React, { lazy, Suspense } from 'react';
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const UserCreatePassword = lazy(() => import('../../components/Users/UserCreatePassword'));

const UserCreatePasswordPage = () => {
    return (
        <Suspense fallback={<LazyLoader />}>
            <UserCreatePassword />
        </Suspense>
    );
};

export default UserCreatePasswordPage;
