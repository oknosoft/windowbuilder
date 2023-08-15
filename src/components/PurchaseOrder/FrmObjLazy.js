
import React from 'react';
import LoadingModal from 'metadata-react/DumbLoader/LoadingModal';

const FrmObj = React.lazy(() => import('./FrmObj'));

export default function PurchaseOrderObj(props) {
  return <React.Suspense fallback={<LoadingModal open text="Загрузка..." />}>
    <FrmObj {...props}/>
  </React.Suspense>;
}
