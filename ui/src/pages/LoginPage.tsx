import * as React from 'react';
import "./LoginPage.scss";
import {Paper, RaisedButton, TextField} from "material-ui";
import {api} from "../services/ApiService";
import {login} from "../services/UserService";

interface state {
    username: string,
    password: string,
}

interface props {

}

class LoginPage extends React.Component<props, state> {
    constructor() {
        super();
        this.login = this.login.bind(this);
        this.state = {
            username: "",
            password: ""
        };
    }

    login() {
        login(this.state.username, this.state.password);
    }

    render() {
        return (<div className="login-page">
            <div className="content">
                <div className="title set-font-family">
                    <h1 className="primary-color">
                        Seedbox Bot
                    </h1>
                    <h2 >
                        用户登入
                    </h2>
                </div>
                <Paper zDepth={1} className="login-form">
                    <TextField
                        className="full-width"
                        defaultValue=""
                        floatingLabelText="用户名"
                        value={this.state.username}
                        onChange={(_, value) => this.setState({username: value})}
                    />
                    <TextField
                        className="full-width"
                        defaultValue=""
                        floatingLabelText="密码"
                        type="password"
                        value={this.state.password}
                        onChange={(_, value) => this.setState({password: value})}
                    />
                    <RaisedButton disabled={!this.state.username || !this.state.password} label="登入"
                                  className="login-btn" primary={true} fullWidth
                                  onClick={this.login}/>
                </Paper>
            </div>
        </div>);
    }
}

export default LoginPage;
