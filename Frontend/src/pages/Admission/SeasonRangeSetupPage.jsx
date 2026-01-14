import React, {Fragment, Suspense} from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import SeasonRangeSetup from "../../components/Admission/SeasonRangeSetup";

const SeasonRangeSetupPage = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader/>}>
                    <SeasonRangeSetup/>
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default SeasonRangeSetupPage;