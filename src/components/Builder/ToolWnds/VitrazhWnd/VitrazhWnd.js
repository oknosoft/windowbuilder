
import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';
import VitrazhTabs from './VitrazhTabs';

function VitrazhWnd({editor, classes}) {
  const ext = extClasses(classes);
  return <VitrazhTabs editor={editor} ext={ext}/>;
}

VitrazhWnd.propTypes = {
  editor: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(VitrazhWnd);
