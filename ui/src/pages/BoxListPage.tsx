import * as React from 'react';
import {getBoxList} from "../services/ApiService";
import {ClientType, getClientTypeIcon, getClientTypeName} from "../typings/ClientType";
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
    max_disk_usage_size_gb: number;
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
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>网址</TableHeaderColumn>
                            <TableHeaderColumn>类型</TableHeaderColumn>
                            <TableHeaderColumn>磁盘配额</TableHeaderColumn>
                            <TableHeaderColumn>操作</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {!!this.state.list && this.state.list.map(item => (
                            <TableRow key={item.id}>
                                <TableRowColumn>
                                    {!!item.url ? <a target="_blank" href={item.url}>{item.url}</a> : "(未设置)"}
                                </TableRowColumn>
                                <TableRowColumn>
                                    <img className="client-icon" src={getClientTypeIcon(item.client_type)}/>
                                    {getClientTypeName(item.client_type)}
                                </TableRowColumn>
                                <TableRowColumn>
                                    {!!item.max_disk_usage_size_gb ?
                                        <span>{item.max_disk_usage_size_gb} GB</span>
                                        : <span>无限</span>
                                    }

                                </TableRowColumn>
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
