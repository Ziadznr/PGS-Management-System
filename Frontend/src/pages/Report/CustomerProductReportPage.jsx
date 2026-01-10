import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import CustomerProductReport from "../../components/Report/CustomerProductReport";

const CustomerProductReportPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                        <CustomerProductReport/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default CustomerProductReportPage;