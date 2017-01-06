/**
 * https://github.com/callemall/material-ui/blob/master/src/styles/getMuiTheme.js
 */

import {deepOrange500} from "material-ui/styles/colors";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";


export const styles = {
  container: {
    height: '100%'
  },
};

export const muiTheme = getMuiTheme({

  palette: {
    accent1Color: deepOrange500,
  },

  appBar: {
    height: 48
  },

  dialog: {
    titleFontSize: 18,
  },

  toolbar: {
    height: 48,
    titleFontSize: 18,
  },

  // spacing: {
  //   desktopGutter: 16,
  //   desktopGutterMore: 24,
  //   desktopGutterLess: 8,
  //   desktopGutterMini: 6,
  //   // desktopKeylineIncrement: 64,
  //   // desktopDropDownMenuItemHeight: 32,
  //   // desktopDropDownMenuFontSize: 15,
  //   // desktopDrawerMenuItemHeight: 48,
  //   // desktopSubheaderHeight: 48,
  //   // desktopToolbarHeight: 56,
  // }

});

export default MuiThemeProvider;
