
import React from 'react';
import PropTypes from 'prop-types';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';
import VitrazhTabs from './VitrazhTabs';

function VitrazhWnd({editor, layer, classes}) {
  const ext = extClasses(classes);
  return <VitrazhTabs tool={editor.tool} layer={layer} ext={ext}/>;
}

VitrazhWnd.propTypes = {
  editor: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(VitrazhWnd);
