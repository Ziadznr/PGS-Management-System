import React, {Fragment, Suspense} from 'react';
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import StudentEnrollmentForm from "../../components/Enrollment/StudentEnrollmentForm";

const StudentEnrollmentPage = () => {
    return (
        <Fragment>
            
                <Suspense fallback={<LazyLoader/>}>
                    <StudentEnrollmentForm/>
                </Suspense>
        
        </Fragment>
    );
};

export default StudentEnrollmentPage;