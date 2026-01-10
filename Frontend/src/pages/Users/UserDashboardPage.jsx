import React, {Fragment,Suspense,lazy} from 'react';
import UserLayout from "../../components/Users/UserLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
const UserDashboard =lazy(() => import('../../components/Dashboard/DashboardRouter'));
const UserDashboardPage = () => {
    return (
        <Fragment>
            <UserLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <UserDashboard/>
                </Suspense>
            </UserLayout>
        </Fragment>
    );
};

export default UserDashboardPage;