# 安装包方法安装

## 安装包生成方法
```
npm run bundle
```


## 安装包使用方法
```
sudo apt-get update
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
mkdir seedbox-bot
tar -xzvf production-bundle.tar.gz --directory seedbox-bot --overwrite
cd seedbox-bot
./install.sh
```

## 更新方法
```
tar -xzvf production-bundle.tar.gz --directory seedbox-bot --overwrite
cd seedbox-bot
./install.sh
“请输入用户名”的时候按Ctrl+C取消
```

数据库migration：
```
npm install -g sequelize-cli
cd server
```

# 传统安装方法

安装方法都以Ubuntu为例，一步一步来，不要跳步骤或者更换顺序。

# 代码获得
```
sudo apt-get install git
```
上传```botcode.key```到同目录
```
chmod 600 botcode.key
GIT_SSH_COMMAND="ssh -i ./botcode.key" git clone botcode@kevin-bot.kevinwang.cc:/home/botcode/qb-bot
```


# BOT安装

## bot 脚本安装方法

### apt-get update
```
sudo apt-get update
```


### Node.js
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
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
exit;
```
运行
```
service mysql restart
```
### 运行
**切换到 qb-bot 根目录之后，** 运行
```
chmod -R 777 bot
npm install -g forever babel-cli
npm install
```
**切换到 qb-bot/bot 目录之后，** 运行
```
npm install
```

复制```src/config.example.js```到```src/config.js```并编辑其内容。

一定需要编辑的是```mysql```中的```password```，设置成数据库的密码

```
npm run compile
cd out
```

先运行 ```node index.js```，如果没有错误，按Ctrl+C
运行```forever start index.js```以开始bot进程

# 后端安装

## 服务器配置
**切换到 qb-bot/server 目录之后，** 

复制```src/config.example.js```到```src/config.js```并编辑其内容。

一定需要编辑的是```mysql```中的```password```，设置成数据库的密码

运行
```
npm install
npm run compile
cd out
node index.js
```
看看有没有错，没错的话Ctrl+C后运行
```
forever start index.js
```

## 用户配置
使用mysql管理软件（推荐navicat），连接数据库

向```users```表加入用户，其中```password```是bcrypt 10轮后的结果。

https://www.dailycred.com/article/bcrypt-calculator  轮数选择10！


# 前端安装
**切换到 qb-bot/ui 目录之后，** 

复制```src/config.example.js```到```src/config.js```并编辑其内容。

一定需要编辑的是```url```，指向后端地址（默认是IP地址加上```:10120```）

运行
```
npm install
npm run build
cd build
npm install http-server -g
http-server
```
这时候，前端会运行在IP地址加上```:8080```，用之前设置好的用户可以登入。
看看有没有错，没错的话Ctrl+C后运行。
```
forever start -c http-server .
```
部署完毕。
