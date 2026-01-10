import React, { Fragment, Suspense } from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import DepartmentCreateUpdate from '../../components/Departments/DepartmentCreteUpdate';

const DepartmentCreatePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <DepartmentCreateUpdate />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DepartmentCreatePage;
