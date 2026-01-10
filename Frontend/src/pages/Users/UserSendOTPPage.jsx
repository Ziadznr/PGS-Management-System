import React, { lazy, Suspense } from 'react';
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const UserSendOTP = lazy(() => import('../../components/Users/UserSendOTP'));

const UserSendOTPPage = () => {
    return (
        <Suspense fallback={<LazyLoader />}>
            <UserSendOTP />
        </Suspense>
    );
};

export default UserSendOTPPage;
