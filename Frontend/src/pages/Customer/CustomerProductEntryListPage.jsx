import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import CustomerProductEntryList from "../../components/Customer/CustomerProductEntryList";
const CustomerProductEntryListPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <CustomerProductEntryList/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default CustomerProductEntryListPage;