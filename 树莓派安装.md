# 需要

1. 树莓派3代B/树莓派3代B+ 
   （[我购买的店铺的链接](https://item.taobao.com/item.htm?spm=a1z09.2.0.0.28352e8d7LPS7V&id=556129616183&_u=123uui44370d)，套餐：官方基础套餐树莓派：Pi3 RS英国版）
2. 外接显示器+HDMI线
3. 外接键盘鼠标
4. 16GB tf卡

# 操作

1. 格式化16GB的tf卡：https://www.sdcard.org/downloads/formatter_4/eula_windows/

2. 下载noobs套件：https://downloads.raspberrypi.org/NOOBS_latest.torrent

3. 解压noobs套件到tf卡当中

4. 组装好树莓派并插入tf卡

5. 连接电源，hdmi线连接显示器、连上鼠标键盘

6. 选择安装Raspbian系统到tf卡

7. 右上角连入wifi

8. （可选推荐）使用VNC连接树莓派，这样可以复制粘贴命令。参考：https://blog.csdn.net/u012952807/article/details/70225700 (在windows中复制，在windows的vnc viewer下Shift+insert粘贴) （或者直接把本文档传到树莓派）

9. （可选推荐）为树莓派更换中国镜像源，参考：https://blog.csdn.net/la9998372/article/details/77886806

10. 安装nodejs 6.x

    ```
    sudo apt update
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt install nodejs
    ```

11. 确定nodejs 6.x安装成功

    ```
    node --version
    ```

    应该显示 ```v6.14.1```

12. 设置cnpm镜像

    ```
    sudo -E npm install -g cnpm --registry=https://registry.npm.taobao.org
    export npm_path=$(npm config get prefix)
    export PATH=$PATH:$npm_path/bin
    ```

13. 获得代码包

    ```
    cd ~
    mkdir bot
    cd bot
    wget http://7xn0vy.dl1.z0.glb.clouddn.com/seedbox-bot-prod-20180401.tar.gz
    tar -xzvf seedbox-bot-prod-20180401.tar.gz
    ```

14. 安装

    ```
    ./install-with-cnpm.sh
    ```

    有一段是编译sqlite（make: 开头），会特别慢，可能要等15分钟才会有动静

    migrate时候会有两个Unhandled rejection，没关系

    接下来输入用户名和密码

15. 连接

    ```
    ifconfig
    ```

    查看树莓派的IP地址，比如是 ```192.168.2.30```

    访问 ```http://192.168.2.30:10120``` 即可登入使用