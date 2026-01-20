import React, {Fragment, Suspense} from 'react';
import UserLayout from "../../components/Users/UserLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import DepartmentLastSemesterCourses from "../../components/Admission/DepartmentLastSemesterCourses";

const DepartmentLastSemesterCoursesPage = () => {
    return (
        <Fragment>
            <UserLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <DepartmentLastSemesterCourses/>
                </Suspense>
            </UserLayout>
        </Fragment>
    );
};

export default DepartmentLastSemesterCoursesPage;