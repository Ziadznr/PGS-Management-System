import React, { Fragment, Suspense, lazy } from 'react';
import UserLayout from "../../components/Users/UserLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const ChairmanDecisionBluePrintList = lazy(() => import('../../components/chairman/ChairmanDecisionBluePrintList'));

const ChairmanDecisionBluePrintListPage = () => {
    return (
        <Fragment>
            <UserLayout>
                <Suspense fallback={<LazyLoader />}>    
                    <ChairmanDecisionBluePrintList />
                </Suspense>
            </UserLayout>
        </Fragment>
    );
};

export default ChairmanDecisionBluePrintListPage;