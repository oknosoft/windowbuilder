import React from 'react';
const ControlsFrame = React.lazy(() => import('./ControlsFrame'));

const defaultOpen = {composite: false, coordinates: false};
const OpenContext = React.createContext(defaultOpen);
export const useOpenContext = () => React.useContext(OpenContext);

export default function Controls(props) {

  const [open, setOpen] = React.useState(defaultOpen);
  const openChange = React.useMemo(() => (newState) => {
    setOpen(prevState => ({...prevState, ...newState}));
  }, []);

  return props.editor ?
    <React.Suspense fallback="Загрузка...">
      <OpenContext.Provider value={{ open, openChange }}>
        <ControlsFrame {...props}/>
      </OpenContext.Provider>
    </React.Suspense> : "Загрузка...";
}
