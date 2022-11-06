import React from 'react';
const ControlsFrame = React.lazy(() => import('./ControlsFrame'));

export default function Controls(props) {
  return props.editor ?
    <React.Suspense fallback="Загрузка...">
      <ControlsFrame {...props}/>
    </React.Suspense> : "Загрузка...";
}
