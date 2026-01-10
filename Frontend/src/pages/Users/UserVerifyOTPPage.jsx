import React, { lazy, Suspense } from 'react';
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const UserVerifyOTP = lazy(() => import('../../components/Users/UserVerifyOTP'));

const UserVerifyOTPPage = () => {
    return (
        <Suspense fallback={<LazyLoader />}>
            <UserVerifyOTP />
        </Suspense>
    );
};

export default UserVerifyOTPPage;
