import {createTheme, responsiveFontSizes} from '@material-ui/core/styles';
import teal from '@material-ui/core/colors/blueGrey';

let theme = createTheme({

  palette: {
    primary: teal, // Purple and green play nicely together.
  },

  mixins: {
    toolbar: {
      minHeight: 48,
    }
  },

  typography: {
    useNextVariants: true,
    fontSize: 12.2,
  },

  overrides: {
    // MuiToolbar: {
    //   root: {
    //     minHeight: 48,
    //   },
    // },
    MuiIconButton: {
      root: {
        padding: 8,
        marginRight: 4,
      },
      sizeSmall: {
        padding: 4,
      }
    },
  },

});

//theme = responsiveFontSizes(theme, {});

export default theme;

