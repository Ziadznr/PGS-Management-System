import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import DepartmentRangeList from "../../components/Admission/DepartmentRangeList";

const DepartmentRangeListPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <DepartmentRangeList/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default DepartmentRangeListPage;