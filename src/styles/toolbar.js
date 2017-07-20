import {createStyleSheet} from 'material-ui/styles';
import colors from 'material-ui/colors/common';

const {white} = colors;

export default createStyleSheet('toolbar', theme => ({
  root: {
    marginTop: 20,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  progress: {
    color: white,
    position: 'absolute',
    top: 8,
  },
  bar: {
    height: '48px',
  }
}));
