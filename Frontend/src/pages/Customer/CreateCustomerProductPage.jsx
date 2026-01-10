import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import CustomerProductCreate from "../../components/Customer/CustomerProductCreate";
const CreateCustomerProductPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <CustomerProductCreate/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default CreateCustomerProductPage;