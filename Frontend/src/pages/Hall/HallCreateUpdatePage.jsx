import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import HallCreateUpdate from "../../components/Hall/HallCreateUpdate";

const HallCreateUpdatePage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <HallCreateUpdate/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default HallCreateUpdatePage;