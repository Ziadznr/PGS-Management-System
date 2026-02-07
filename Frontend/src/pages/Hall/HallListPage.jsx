import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import HallList from "../../components/Hall/HallList";

const HallListPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <HallList/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default HallListPage;