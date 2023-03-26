import React from 'react';
const OpenContextProvider = React.lazy(() => import('./OpenContext'));

export default function Controls(props) {
  return props.editor ?
    <React.Suspense fallback="Загрузка...">
      <OpenContextProvider {...props}/>
    </React.Suspense> : "Загрузка...";
}
