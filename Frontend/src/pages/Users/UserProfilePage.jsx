import React, { Fragment, lazy, Suspense } from 'react';
import UserLayout from "../../components/Users/UserLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const UserProfile = lazy(() => import('../../components/Users/UserProfile'));

const UserProfilePage = () => {
    return (
        <Fragment>
            <UserLayout>
                <Suspense fallback={<LazyLoader />}>
                    <UserProfile />
                </Suspense>
            </UserLayout>
        </Fragment>
    );
};

export default UserProfilePage;
