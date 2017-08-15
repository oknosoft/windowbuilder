
import {createMuiTheme } from 'material-ui/styles';
import colors from 'material-ui/colors/common';

const theme = createMuiTheme({
  overrides: {
    MuiAppBar: {
      root: {
        background: colors.lightBlack,
      }
    },
  },
});
theme.palette.primary1Color = colors.lightBlack;
theme.palette.primary2Color = colors.minBlack;

export default theme;

