import React, {Fragment, Suspense} from 'react';
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import PublicNoticeList from "../../components/Notice/PublicNoticeList";
const PublicNoticeListPage = () => {
    return (
        <Fragment>
            
                <Suspense fallback={<LazyLoader/>}>
                    <PublicNoticeList/>
                </Suspense>
            
        </Fragment>
    );
};
export default PublicNoticeListPage;