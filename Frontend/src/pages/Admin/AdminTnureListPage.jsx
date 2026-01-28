import React, {Fragment, lazy, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
const AdminTenureList =lazy(() => import('../../components/Admin/AdminTenureList'));
const AdminTenureListPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <AdminTenureList/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};
export default AdminTenureListPage;