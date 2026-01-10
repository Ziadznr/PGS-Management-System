import React, {Fragment, Suspense} from 'react';
import CustomerLayout from "../../components/Chairmans/CustomerLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import CustomerProductEntryList from "../../components/Customer/CustomerProductEntryList";
const IndividualProductEntryListPage = () => {
    return (
        <Fragment>
            <CustomerLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <CustomerProductEntryList/>
                </Suspense>
            </CustomerLayout>
        </Fragment>
    );
};

export default IndividualProductEntryListPage;