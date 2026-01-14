import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import Notice from "../../components/Notice/Notice";
const NoticePage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <Notice/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};
export default NoticePage;