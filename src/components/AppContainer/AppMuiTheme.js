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

  spacing: {
    desktopGutter: 18,
    desktopKeylineIncrement: 96,
    // desktopDropDownMenuItemHeight: 32,
    // desktopDropDownMenuFontSize: 15,
    // desktopDrawerMenuItemHeight: 32,
    // desktopSubheaderHeight: 48,
    // desktopToolbarHeight: 56,
  }

});

export default MuiThemeProvider;
