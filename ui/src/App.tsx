import * as React from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {AppBar, IconButton} from "material-ui";
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {NavigationClose} from "material-ui/svg-icons";

const muiTheme = getMuiTheme({
    fontFamily: ' "lucida grande", "lucida sans unicode", lucida, helvetica, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif',
    appBar: {
           height: 50,
    },
});

class App extends React.Component {
  render() {
    return (
      <div className="App">
          <MuiThemeProvider muiTheme={muiTheme}>
              <AppBar
                  title="PT Box Manager"
                  iconElementLeft={<div/>}
                  iconElementRight={<div/>}
              />
          </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
