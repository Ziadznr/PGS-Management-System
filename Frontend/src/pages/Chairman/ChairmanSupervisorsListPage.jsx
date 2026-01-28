import React, { Fragment, Suspense, lazy } from 'react';
import UserLayout from "../../components/Users/UserLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const ChairmanSupervisorsList = lazy(() => import('../../components/chairman/ChairmanSupervisorsList'));

const ChairmanSupervisorsListPage = () => {
    return (
        <Fragment>
            <UserLayout>
                <Suspense fallback={<LazyLoader />}>    
                    <ChairmanSupervisorsList />
                </Suspense>
            </UserLayout>
        </Fragment>
    );
};

export default ChairmanSupervisorsListPage;