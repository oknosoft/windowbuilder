import createTheme from '@material-ui/core/styles/createTheme';
import teal from '@material-ui/core/colors/blueGrey';
import { purple } from '@material-ui/core/colors';


const theme = createTheme({

  palette: {
    primary: teal, // Purple and green play nicely together.
    type: 'light',
  },

  mixins: {
    toolbar: {
      minHeight: 48,
    }
  },

  // custom: {
  //   appbar: {
  //     position: 'fixed',
  //   }
  // },

  typography: {
    useNextVariants: true,
    subtitle2: {
      fontSize: '0.95rem',
    },
  },


  // overrides: {
  //   MuiToolbar: {
  //     root: {
  //       minHeight: 48,
  //     },
  //   },
  //   MuiAppBar: {
  //     root: {
  //       backgroundColor: colors.lightBlack,
  //     }
  //   },
  // },

});

export default theme;

