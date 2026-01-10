import React, { Fragment, Suspense, useState } from 'react';
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import LazyLoader from "../../components/MasterLayout/LazyLoader";
import SectionCreateUpdate from '../../components/Section/SectionCreateUpdate';
import SectionList from '../../components/Section/SectionList';

const SectionOperationPage = () => {
  const [refreshListFlag, setRefreshListFlag] = useState(false);

  const refreshList = () => setRefreshListFlag(!refreshListFlag);

  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SectionCreateUpdate onSaveSuccess={refreshList} />
          <SectionList refreshFlag={refreshListFlag} />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SectionOperationPage;
