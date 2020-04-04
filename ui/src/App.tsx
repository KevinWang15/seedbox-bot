import * as React from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MainPage from "./pages/MainPage";
import {isLoggedIn} from "./services/UserService";
import LoginPage from "./pages/LoginPage";

const muiTheme = getMuiTheme({
    fontFamily: '"lucida grande", "lucida sans unicode", lucida, helvetica, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif',
    appBar: {
        height: 50,
    },
});

//TODO: use redux
let appRoot = {ref: null};

class App extends React.Component {

    constructor() {
        // @ts-ignore
        super();
        appRoot.ref = this;
    }

    render() {
        return (
            <div className="App">
                <MuiThemeProvider muiTheme={muiTheme}>
                    {
                        isLoggedIn() ? <MainPage/> : <LoginPage/>
                    }
                </MuiThemeProvider>
            </div>
        );
    }
}

export default App;
export {appRoot};
