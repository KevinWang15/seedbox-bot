import * as React from 'react';
import {deleteBox, getBoxList, createBox, editBox} from "../services/ApiService";
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
    id: number;
    name: string;
    url: string;
    max_size_mb?: number;
    min_size_mb?: number;
    max_share_ratio?: number;
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
        return getBoxList().then(_ => {
            this.setState({
                list: _.list
            });
        });
    }

    saveEdit() {
        new Promise((res, rej) => {
            if (this.state.currentEditing.client_type + "" != this.state.currentEditing.client_type as any) {
                swal({
                    title: '必须选择客户端类型',
                    type: 'error'
                });
                rej();
                return;
            }
            if (!/^https?:\/\/[^\/]+\/?$/m.test(this.state.currentEditing.url)) {
                swal({
                    title: '客户端地址看起来无效',
                    text: "请输入有效的URL，且一般情况下，客户端地址不能带路径（如 http://example.com:9091/transmission/web/ 是错误的，而 http://example.com:9091/ 才是正确的）。确定要继续吗？",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: '继续',
                    cancelButtonText: '取消',
                }).then(() => {
                    res();
                }).catch(rej);
                return;
            }
            res();
        }).then(() => {
            editBox(this.state.currentEditing).then(_ => {
                swal({
                    title: '保存成功',
                    type: 'success'
                });
                this.updateData().then(() => {
                    this.setState({currentEditing: null});
                });
            });
        }).catch(() => {
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
                    <Table className="rss-table">
                        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                            <TableRow>
                                <TableHeaderColumn>名称</TableHeaderColumn>
                                <TableHeaderColumn style={{width: "50%"}}>RSS网址</TableHeaderColumn>
                                <TableHeaderColumn>最大大小 (MB)</TableHeaderColumn>
                                {/*<TableHeaderColumn>最大分享率</TableHeaderColumn>*/}
                                <TableHeaderColumn>操作</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={false}>
                            {!!this.state.currentEditing.rss_feeds && this.state.currentEditing.rss_feeds.map((item, index) => (
                                <TableRow key={index}>
                                    <TableRowColumn>
                                        <TextField
                                            fullWidth
                                            hintText="请输入名称"
                                            value={item.name}
                                            onChange={(_, value) => {
                                                let rss_feeds = [...this.state.currentEditing.rss_feeds];
                                                rss_feeds[index] = {
                                                    ...rss_feeds[index],
                                                    name: value
                                                };
                                                this.setState({
                                                    currentEditing: {
                                                        ...this.state.currentEditing,
                                                        rss_feeds
                                                    }
                                                })
                                            }}
                                        />
                                    </TableRowColumn>
                                    <TableRowColumn style={{width: "50%"}}>
                                        <TextField
                                            fullWidth
                                            hintText="请输入网址"
                                            value={item.url}
                                            onChange={(_, value) => {
                                                let rss_feeds = [...this.state.currentEditing.rss_feeds];
                                                rss_feeds[index] = {
                                                    ...rss_feeds[index],
                                                    url: value
                                                };
                                                this.setState({
                                                    currentEditing: {
                                                        ...this.state.currentEditing,
                                                        rss_feeds
                                                    }
                                                })
                                            }}
                                        />
                                    </TableRowColumn>
                                    <TableRowColumn>
                                        <TextField
                                            fullWidth
                                            hintText="单位MB, 留空为不限"
                                            value={item.max_size_mb || ""}
                                            onChange={(_, value) => {
                                                let rss_feeds = [...this.state.currentEditing.rss_feeds];
                                                rss_feeds[index] = {
                                                    ...rss_feeds[index],
                                                    max_size_mb: +value || 0
                                                };
                                                this.setState({
                                                    currentEditing: {
                                                        ...this.state.currentEditing,
                                                        rss_feeds
                                                    }
                                                })
                                            }}
                                        />
                                    </TableRowColumn>
                                    {/*<TableRowColumn>*/}
                                        {/*<TextField*/}
                                            {/*fullWidth*/}
                                            {/*hintText="留空为不限"*/}
                                            {/*value={item.max_share_ratio || ""}*/}
                                            {/*onChange={(_, value) => {*/}
                                                {/*let rss_feeds = [...this.state.currentEditing.rss_feeds];*/}
                                                {/*rss_feeds[index] = {*/}
                                                    {/*...rss_feeds[index],*/}
                                                    {/*max_share_ratio: +value || 0*/}
                                                {/*};*/}
                                                {/*this.setState({*/}
                                                    {/*currentEditing: {*/}
                                                        {/*...this.state.currentEditing,*/}
                                                        {/*rss_feeds*/}
                                                    {/*}*/}
                                                {/*})*/}
                                            {/*}}*/}
                                        {/*/>*/}
                                    {/*</TableRowColumn>*/}
                                    <TableRowColumn>
                                        <div>
                                            <RaisedButton secondary
                                                          className="delete-button"
                                                          icon={<IconActionDelete/>}
                                                          style={buttonStyle}
                                                          onClick={() => {
                                                              let rss_feeds = [...this.state.currentEditing.rss_feeds];
                                                              rss_feeds.splice(index, 1);
                                                              this.setState({
                                                                  currentEditing: {
                                                                      ...this.state.currentEditing,
                                                                      rss_feeds
                                                                  }
                                                              })
                                                          }}
                                            >
                                            </RaisedButton>
                                        </div>
                                    </TableRowColumn>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>


                    <RaisedButton primary icon={<IconContentAdd/>} style={{
                        marginTop: 14
                    }} onClick={() => {
                        let rss_feeds = [...this.state.currentEditing.rss_feeds];
                        rss_feeds.push({id: 0, name: "", url: "", max_size_mb: null, min_size_mb: null});
                        this.setState({currentEditing: {...this.state.currentEditing, rss_feeds}});
                    }}
                    />
                </Paper>
                <div style={{margin: 10}}>
                    <RaisedButton primary label="保存" style={{
                        marginRight: 10
                    }} onClick={() => this.saveEdit()}
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
