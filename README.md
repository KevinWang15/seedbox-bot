# 安装方法

安装方法都以Ubuntu为例

## bot 脚本安装方法

### apt-get update
```
sudo apt-get update
```

### git
```
sudo apt-get install git
```

### Node.js
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 拉取源代码
```
git clone https://github.com/KevinWang15/qb-bot.git
```

### 安装mysql
```
sudo apt-get install mysql-server -y
```
设置root密码并记住

编辑配置文件``` /etc/mysql/mysql.conf.d/mysqld.cnf```

找到
```
bind-address            = 127.0.0.1
```
修改为
```
bind-address            = 0.0.0.0
```
**切换到 qb-bot 根目录之后，** 运行
```
mysql -u root -p
```
输入之前设置的密码登入sql
```
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '<替换成你设置的密码>' WITH GRANT OPTION;
FLUSH PRIVILEGES;

CREATE DATABASE qbbot CHARACTER SET utf8 COLLATE utf8_general_ci;
use qbbot;
source database.sql;
exit
```
运行
```
service mysql reload
```
### 运行
**切换到 qb-bot 根目录之后，** 运行
```
chmod -R 777 bot
npm install
npm install -g forever babel-cli
npm run compile
cd out
```

复制```config.example.js```到```config.js```并编辑其内容。

一定需要编辑的是```mysql```中的```password```，设置成数据库的密码

先运行 ```node index.js```，如果没有错误，按Ctrl+C
运行```forever start index.js```以开始bot进程

### 配置
使用mysql管理软件（推荐navicat），连接数据库