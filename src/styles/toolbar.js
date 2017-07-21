import {createStyleSheet} from 'material-ui/styles';
import colors from 'material-ui/colors/common';

export default createStyleSheet('toolbar', theme => ({
  root: {
    marginTop: 20,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  progress: {
    color: colors.white,
    position: 'absolute',
    top: 8,
  },
  bar: {
    height: 48,
  },
  appbar: {
    backgroundColor: colors.lightBlack,
  }
}));
