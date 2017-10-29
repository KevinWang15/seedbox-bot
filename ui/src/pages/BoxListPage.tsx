import * as React from 'react';
import {deleteBox, getBoxList} from "../services/ApiService";
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
import swal from 'sweetalert2/dist/sweetalert2.all.min.js';
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
        this.updateData();
    }

    private updateData() {
        getBoxList().then(_ => {
            this.setState({
                list: _.list
            });
        });
    }

    deleteItem(item) {
        swal({
            title: '确定吗?',
            text: "确定要删除 " + (item.url || "") + " ?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'rgb(255, 64, 129)',
            confirmButtonText: '删除',
            cancelButtonText: '取消',
        }).then(() => {
            deleteBox(item.id).then(() => {
                this.updateData();
                swal({
                    title: '删除成功',
                    type: 'success'
                })
            }).catch(() => {
            });
        }).catch(() => {
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
                                                      style={buttonStyle}
                                                      onClick={() => this.deleteItem(item)}
                                        >
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
