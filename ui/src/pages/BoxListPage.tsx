import * as React from 'react';
import {deleteBox, getBoxList, createBox} from "../services/ApiService";
import {ClientType, getClientTypeIcon, getClientTypeName} from "../typings/ClientType";
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';
import {
    FlatButton, FloatingActionButton, MenuItem, Paper, RaisedButton, SelectField,
    TextField
} from "material-ui";
import IconContentAdd from 'material-ui/svg-icons/content/add';
import IconActionDelete from 'material-ui/svg-icons/action/delete';
import swal from 'sweetalert2/dist/sweetalert2.all.min.js';
import clone from 'clone';
import "./BoxListPage.scss";

interface rssConfig {
    name: string;
    url: string;
    max_size_mb: number;
}

interface boxConfig {
    id: number;
    url: string;
    max_disk_usage_size_gb: number;
    client_type: ClientType;
    basic_auth_username: string;
    basic_auth_password: string;
    username: string;
    password: string;
    rss_feeds: rssConfig[];
}

interface state {
    list: Array<boxConfig>;
    currentEditing: boxConfig;
}
class BoxListPage extends React.Component<{}, state> {
    constructor() {
        super();
        this.state = {
            list: [],
            currentEditing: null
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

    cancelEdit() {
        swal({
            title: '确定吗?',
            text: "确定要取消编辑? 未保存的更改将会丢失。",
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: '取消编辑',
            cancelButtonText: '继续编辑',
        }).then(() => {
            this.setState({currentEditing: null});
        }).catch(() => {
        });
    }

    createBox() {
        createBox().then(_ => {
            this.updateData();
        });
    }

    deleteBox(item) {
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
            {!this.state.currentEditing &&
            <div>
                <Paper zDepth={1}>
                    <Table>
                        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                            <TableRow>
                                <TableHeaderColumn>网址</TableHeaderColumn>
                                <TableHeaderColumn>类型</TableHeaderColumn>
                                <TableHeaderColumn>磁盘配额</TableHeaderColumn>
                                <TableHeaderColumn>RSS数量</TableHeaderColumn>
                                <TableHeaderColumn>操作</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={false}>
                            {!!this.state.list && this.state.list.map(item => (
                                <TableRow key={item.id}>
                                    <TableRowColumn>
                                        {!!item.url ? <a target="_blank"
                                                         href={item.url}>{item.url}</a> : "(未设置)"}
                                    </TableRowColumn>
                                    <TableRowColumn>
                                        <img className="client-icon"
                                             src={getClientTypeIcon(item.client_type)}/>
                                        {getClientTypeName(item.client_type)}
                                    </TableRowColumn>
                                    <TableRowColumn>
                                        {!!item.max_disk_usage_size_gb ?
                                            <span>{item.max_disk_usage_size_gb} GB</span>
                                            : <span>无限</span>
                                        }
                                    </TableRowColumn>
                                    <TableRowColumn>
                                        {item.rss_feeds.length}
                                    </TableRowColumn>
                                    <TableRowColumn>
                                        <div>
                                            <RaisedButton primary label="编辑配置"
                                                          onClick={() => this.setState({currentEditing: clone(item)})}
                                                          style={buttonStyle}/>
                                            <RaisedButton secondary
                                                          className="delete-button"
                                                          icon={<IconActionDelete/>}
                                                          style={buttonStyle}
                                                          onClick={() => this.deleteBox(item)}
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
                }} onClick={() => this.createBox()}
                />
            </div>
            }

            {!!this.state.currentEditing &&
            <div className="div-edit">
                <Paper className="sub-field">
                    <h1>基本配置</h1>

                    <TextField
                        fullWidth={true}
                        floatingLabelText="WebUI网址"
                        floatingLabelFixed={true}
                        hintText="请输入盒子WebUI网址，如： http://example.com:9091/"
                        value={this.state.currentEditing.url || ""}
                        onChange={(_, value) => this.setState({
                            currentEditing: {
                                ...this.state.currentEditing,
                                url: value
                            }
                        })}
                    />

                    <div style={{display: "flex"}}>
                        <SelectField
                            style={{flex: 1}}
                            fullWidth={true}
                            floatingLabelFixed={true}
                            hintText="请选择盒子客户端类型"
                            floatingLabelText="客户端类型"
                            value={"" + this.state.currentEditing.client_type}
                            onChange={(event, index, value) => {
                                console.log("select", value);
                                this.setState({
                                    currentEditing: {
                                        ...this.state.currentEditing,
                                        client_type: value
                                    }
                                })
                            }}
                        >
                            {Object.keys(ClientType).filter(_ => +_ + "" == _).map(type => (
                                <MenuItem key={type} value={type}
                                          primaryText={
                                              <span
                                                  className="box-list-page">
                                              <img className="client-icon"
                                                   src={getClientTypeIcon(type)}/>
                                                  {getClientTypeName(type)}
                                          </span>}/>
                            ))}
                        </SelectField>
                        <TextField
                            style={{flex: 1}}
                            fullWidth={true}
                            floatingLabelText="磁盘配额 (GB)"
                            floatingLabelFixed={true}
                            hintText="请输入盒子最多能使用的磁盘空间 (GB)，留空为不限制"
                            value={this.state.currentEditing.max_disk_usage_size_gb || ""}
                            onChange={(_, value) => this.setState({
                                currentEditing: {
                                    ...this.state.currentEditing,
                                    max_disk_usage_size_gb: +value
                                }
                            })}
                        />
                    </div>
                </Paper>

                <div style={{display: 'flex'}}>

                    <Paper className="sub-field" style={{flex: 1}}>
                        <h1>
                            HTTP Basic认证
                        </h1>
                        <h2>
                            如果有网页弹框式认证，请输入用户名密码，没有请留空
                        </h2>
                        <TextField
                            floatingLabelText="Basic认证 用户名"
                            floatingLabelFixed={true}
                            hintText="请输入Basic认证用户名"
                            value={this.state.currentEditing.basic_auth_username || ""}
                            onChange={(_, value) => this.setState({
                                currentEditing: {
                                    ...this.state.currentEditing,
                                    basic_auth_username: value
                                }
                            })}
                        />
                        <TextField
                            floatingLabelText="Basic认证 密码"
                            floatingLabelFixed={true}
                            type="password"
                            hintText="请输入Basic认证密码"
                            value={this.state.currentEditing.basic_auth_password || ""}
                            onChange={(_, value) => this.setState({
                                currentEditing: {
                                    ...this.state.currentEditing,
                                    basic_auth_password: value
                                }
                            })}
                        />

                    </Paper>

                    <Paper className="sub-field" style={{flex: 1}}>
                        <h1>
                            客户端认证
                        </h1>
                        <h2>
                            如果客户端要求认证（有登入界面，非弹框式），请输入用户名密码，没有请留空
                        </h2>
                        <TextField
                            floatingLabelText="客户端认证 用户名"
                            floatingLabelFixed={true}
                            hintText="请输入客户端认证用户名"
                            value={this.state.currentEditing.username || ""}
                            onChange={(_, value) => this.setState({
                                currentEditing: {
                                    ...this.state.currentEditing,
                                    username: value
                                }
                            })}
                        />
                        <TextField
                            floatingLabelText="客户端认证 密码"
                            floatingLabelFixed={true}
                            type="password"
                            hintText="请输入客户端认证密码"
                            value={this.state.currentEditing.password || ""}
                            onChange={(_, value) => this.setState({
                                currentEditing: {
                                    ...this.state.currentEditing,
                                    password: value
                                }
                            })}
                        />
                    </Paper>
                </div>

                <Paper className="sub-field">
                    <h1>RSS 配置</h1>
                    {/*<Table>*/}
                        {/*<TableHeader displaySelectAll={false} adjustForCheckbox={false}>*/}
                            {/*<TableRow>*/}
                                {/*<TableHeaderColumn>名称</TableHeaderColumn>*/}
                                {/*<TableHeaderColumn>网址</TableHeaderColumn>*/}
                                {/*<TableHeaderColumn>最大大小</TableHeaderColumn>*/}
                                {/*<TableHeaderColumn>操作</TableHeaderColumn>*/}
                            {/*</TableRow>*/}
                        {/*</TableHeader>*/}
                        {/*<TableBody displayRowCheckbox={false}>*/}
                            {/*{!!this.state.list && this.state.list.map(item => (*/}
                                {/*<TableRow key={item.id}>*/}
                                    {/*<TableRowColumn>*/}
                                        {/*{!!item.url ? <a target="_blank"*/}
                                                         {/*href={item.url}>{item.url}</a> : "(未设置)"}*/}
                                    {/*</TableRowColumn>*/}
                                    {/*<TableRowColumn>*/}
                                        {/*<img className="client-icon"*/}
                                             {/*src={getClientTypeIcon(item.client_type)}/>*/}
                                        {/*{getClientTypeName(item.client_type)}*/}
                                    {/*</TableRowColumn>*/}
                                    {/*<TableRowColumn>*/}
                                        {/*{!!item.max_disk_usage_size_gb ?*/}
                                            {/*<span>{item.max_disk_usage_size_gb} GB</span>*/}
                                            {/*: <span>无限</span>*/}
                                        {/*}*/}

                                    {/*</TableRowColumn>*/}
                                    {/*<TableRowColumn>*/}
                                        {/*<div>*/}
                                            {/*<RaisedButton primary label="编辑配置"*/}
                                                          {/*onClick={() => this.setState({currentEditing: clone(item)})}*/}
                                                          {/*style={buttonStyle}/>*/}
                                            {/*<RaisedButton secondary*/}
                                                          {/*className="delete-button"*/}
                                                          {/*icon={<IconActionDelete/>}*/}
                                                          {/*style={buttonStyle}*/}
                                                          {/*onClick={() => this.deleteBox(item)}*/}
                                            {/*>*/}
                                            {/*</RaisedButton>*/}
                                        {/*</div>*/}
                                    {/*</TableRowColumn>*/}
                                {/*</TableRow>*/}
                            {/*))}*/}

                        {/*</TableBody>*/}
                    {/*</Table>*/}
                </Paper>
                <div style={{margin: 10}}>
                    <RaisedButton primary label="保存" style={{
                        marginRight: 10
                    }} onClick={() => this.createBox()}
                    />
                    <RaisedButton label="取消" style={{}} onClick={() => this.cancelEdit()}
                    />
                </div>

                {/*{JSON.stringify(this.state.currentEditing)}*/}
            </div>}
        </div>);
    }
}

export default BoxListPage;
