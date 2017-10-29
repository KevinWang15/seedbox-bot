import * as React from 'react';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {AppBar, IconButton, IconMenu, MenuItem, Divider} from "material-ui";
import BoxListPage from "./BoxListPage";
import {logout} from "../services/UserService";

interface state {
    currentPage: any
}

class MainPage extends React.Component<{}, state> {
    constructor() {
        super();
        this.state = {
            currentPage: <BoxListPage/>
        };
    }

    render() {
        return (<div>
            <AppBar
                title="PT Box Manager"
                iconElementLeft={<div/>}
                iconElementRight={<IconMenu
                    iconButtonElement={
                        <IconButton><MoreVertIcon /></IconButton>
                    }
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                >
                    {/*<MenuItem primaryText="默认盒子"/>*/}
                    {/*<MenuItem primaryText="盒子1"/>*/}
                    {/*<MenuItem primaryText="盒子2"/>*/}
                    {/*<MenuItem primaryText="盒子3"/>*/}
                    {/*<MenuItem primaryText="盒子4"/>*/}
                    {/*<MenuItem primaryText="..."/>*/}
                    {/*<Divider />*/}
                    {/*<MenuItem primaryText="添加或删除盒子"/>*/}
                    {/*<Divider />*/}
                    <MenuItem onClick={logout} primaryText="登出"/>
                </IconMenu>}
            />
            {this.state.currentPage}
        </div>);
    }
}

export default MainPage;
