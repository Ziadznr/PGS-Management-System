import React, { Fragment, Suspense, lazy } from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";

const DepartmentList = lazy(() => import('../../components/Departments/DepartmentList'));

const DepartmentListPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader />}>    
                    <DepartmentList />
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default DepartmentListPage;
