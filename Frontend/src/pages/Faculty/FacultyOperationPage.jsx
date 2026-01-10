import React, { Fragment, Suspense, useState } from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import FacultyCreateUpdate from '../../components/Faculties/FacultyCreateUpdate';
import FacultyList from '../../components/Faculties/FacultyList';

const FacultyOperationPage = () => {
  const [refreshListFlag, setRefreshListFlag] = useState(false);

  // Toggle flag to refresh the list
  const refreshList = () => setRefreshListFlag(!refreshListFlag);

  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <FacultyCreateUpdate onSaveSuccess={refreshList} />
          <FacultyList refreshFlag={refreshListFlag} />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default FacultyOperationPage;
