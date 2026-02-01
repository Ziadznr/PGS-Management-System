import React, { Fragment, Suspense, lazy } from 'react';
import UserLayout from "../../components/Users/UserLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const ChairmanTenure = lazy(() => import('../../components/Dean/ChairmanTenure'));

const ChairmanTenurePage = () => {
    return (
        <Fragment>
            <UserLayout>
                <Suspense fallback={<LazyLoader />}>    
                    <ChairmanTenure />
                </Suspense>
            </UserLayout>
        </Fragment>
    );
};

export default ChairmanTenurePage;