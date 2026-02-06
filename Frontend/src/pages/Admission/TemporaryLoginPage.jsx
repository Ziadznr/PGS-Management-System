import React, { Fragment, lazy, Suspense } from 'react';
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const TemporaryLogin = lazy(() => import('../../components/Admission/TemporaryLogin'));

const TemporaryLoginPage = () => {
    return (
        <Fragment>
            <Suspense fallback={<LazyLoader />}>
                <TemporaryLogin />
            </Suspense>
        </Fragment>
    );
};

export default TemporaryLoginPage;
