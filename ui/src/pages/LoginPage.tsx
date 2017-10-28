import * as React from 'react';
import "./LoginPage.scss";
import {Paper, RaisedButton, TextField} from "material-ui";

class LoginPage extends React.Component {
    render() {
        return (<div className="login-page">
            <div className="content">
                <div className="title set-font-family">
                    <h1 className="primary-color">
                        PT Box Manager
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
                    />
                    <TextField
                        className="full-width"
                        defaultValue=""
                        floatingLabelText="密码"
                    />
                    <RaisedButton label="登入" className="login-btn" primary={true} fullWidth />
                </Paper>
            </div>
        </div>);
    }
}

export default LoginPage;
