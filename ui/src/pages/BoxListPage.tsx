import * as React from 'react';
import {getBoxList} from "../services/ApiService";
import {ClientType, getClientTypeName} from "../typings/ClientType";
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';
import {FlatButton, FloatingActionButton, Paper, RaisedButton} from "material-ui";
import IconContentAdd from 'material-ui/svg-icons/content/add';
import IconActionDelete from 'material-ui/svg-icons/action/delete';
import "./BoxListPage.scss";

interface boxConfig {
    id: number;
    url: string;
    client_type: ClientType;
}

interface state {
    list: Array<boxConfig>
}
class BoxListPage extends React.Component<{}, state> {
    constructor() {
        super();
        this.state = {
            list: []
        }
    }

    componentDidMount() {
        getBoxList().then(_ => {
            this.setState({
                list: _.list
            });
        });
    }

    render() {
        const buttonStyle = {
            marginRight: 4
        };
        return (<div style={{padding: 20}} className="box-list-page">
            <Paper zDepth={1}>
                <Table>
                    <TableHeader displaySelectAll={false}>
                        <TableRow>
                            <TableHeaderColumn>网址</TableHeaderColumn>
                            <TableHeaderColumn>类型</TableHeaderColumn>
                            <TableHeaderColumn>操作</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {!!this.state.list && this.state.list.map(item => (
                            <TableRow>
                                <TableRowColumn>{item.url || "(未设置)"}</TableRowColumn>
                                <TableRowColumn>{getClientTypeName(item.client_type)}</TableRowColumn>
                                <TableRowColumn>
                                    <div>
                                        <RaisedButton primary label="编辑配置" style={buttonStyle}/>
                                        <RaisedButton secondary
                                                      className="delete-button"
                                                      icon={<IconActionDelete/>}
                                                      style={buttonStyle}>
                                        </RaisedButton>
                                    </div>
                                </TableRowColumn>
                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </Paper>
            <RaisedButton primary icon={<IconContentAdd/>} style={{
                marginTop: 14
            }}/>

        </div>);
    }
}

export default BoxListPage;
