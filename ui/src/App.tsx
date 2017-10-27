import * as React from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MainPage from "./pages/MainPage";

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
              <MainPage/>
          </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
