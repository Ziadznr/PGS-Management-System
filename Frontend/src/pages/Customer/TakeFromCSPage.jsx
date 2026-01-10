import React, {Fragment, Suspense} from 'react';
import CustomerLayout from "../../components/Chairmans/CustomerLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import SalesList from "../../components/Sales/SalesList";

const TakeFromCSPage = () => {
    return (
        <Fragment>
            <CustomerLayout>
                <Suspense fallback={<LazyLoader/>}>
                        <SalesList/>
                </Suspense>
            </CustomerLayout>
        </Fragment>
    );
};

export default TakeFromCSPage;