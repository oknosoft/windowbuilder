import React from 'react';
import MUIIconButton from '@material-ui/core/IconButton';

export default React.forwardRef(function IconButton(props, ref) {
  return <MUIIconButton size="small" ref={ref} {...props} />;
});
