# 消息中心本地 Docker 配置
> 起因：因消息中心所用的消息队列服务，是基于 `阿里云` 提供的。官方并没有 `NodeJS`的 API 接口。其 `C++` 模块在 `Mac` 与 `Ubuntu` 上的表现形式差别很大。在本地 `Mac` 上开发，不能完全模拟 服务器 上的表现，所以需要在本地模拟服务器环境进行开发。

<br>

## Docker 安装
这个比较简单，可以参考 [Mac 上安装 Docker](https://yeasy.gitbooks.io/docker_practice/content/install/mac.html)

## 选择镜像版本
因为服务器使用的是 `Ubuntu 14.04`，所以选择的 Docker 基础镜像为 `Ubuntu:14.04`。
```shell
docker pull ubuntu:14.04
```
在控制台/命令行输入上述指令，等待片刻即可完成下载。

## 创建 Dockerfile 文件
第一版本：漏洞，安装东西过多，且出现 `apt-get` 更新不完全，导致 `npm` 的版本过低，无法完成后续安装。
```Dockerfile
FROM ubuntu:14.04
RUN sudo apt update \
    && sudo apt-get install -y python-software-properties \
    && sudo apt-get install -y curl \
    && sudo apt-get install make \
    && curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - \
    && curl -L https://www.npmjs.com/install.sh \
    && sudo apt-get install -y nodejs \
    && alias cnpm="npm --registry=https://registry.npm.taobao.org \
--cache=$HOME/.npm/.cache/cnpm \
--disturl=https://npm.taobao.org/dist \
--userconfig=$HOME/.cnpmrc" \
    && npm install npm@latest -g \
    && curl https://raw.githubusercontent.com/creationix/nvm/v0.16.1/install.sh 
```
这个版本的 Dockerfile 比较烦琐,安装了比较基础的东西。
因为没有解决掉 `bash` 与 `sh` 在 `Dockerfile`中的切换问题，还是需要手动去安装一些环境。而过多的 RUN 会在增加镜像的生成层。所以，直接写了下面的一个简洁版本。
```Dockerfile
FROM Ubuntu:14.04
RUN bash | echo start to install things \
    && sudo apt update \
    && sudo apt-get install -y python-software-properties \
    && sudo apt-get install -y curl \
    && sudo apt-get install -y make \
    && apt-get install -y gcc \
    && apt-get install g++ \
    && curl https://raw.githubusercontent.com/creationix/nvm/v0.16.1/install.sh | bash \
```

## 生成镜像
将工作目录切换至 `Dockerfile` 所在的目录下，运行：
```shell
docker build -t msgcenter_docker .
```
因为创建镜像过程中，上下文 `.` 的影响，所以将共享目录没有放在 `Dockerfile`中实现。

## 生成容器
镜像生成之后，使用 **```docker image ls```** 查看当前镜像。
基于 `msgcenter_docker` 镜像，可以生成运行的容器：
```shell
 docker run -dit -v 消息中心目录:/app/messageCenter \
 -p 7077:7077 \
 -p 80:80 \
 -p 7080:7080 \
 -p 81:81 \
 -p 8080:8080 \
 msgCenterContainer \
 /bin/bash
```
`-dit`: 表示后台，标准输入/输出流，类终端形式运行容器
## 手动安装剩余配置
接下来的部分比较烦琐，我也很想全部放在 Dockerfile 中实现。。。
这个部分等待后续全部在 Dockerfile 中实现！~~~
#### 1. 安装 npm ,node
```shell
nvm install v6.10.2
```
因为 npm 依赖于 node 产生。所以第二个 Dockerfile 采用更简洁的方式，防止了由基础镜像得到的容器，获取不到最新版本的 bug.
#### 2. 安装 snpm -- 私有库安装
```shell
npm install snpm -g --registry=http://registry.npm.souche-inc.com
```
#### 3. 安装 node-gyp、make、gcc、g++ 等编译工具
```shell
apt-get install -y make
apt-get install -y gcc
apt-get install -y g++
npm install node-gyp
```
上述四行代码，与 Dockerfile 有部分重合，可以去掉重合的部分。
#### 4. 迁移项目代码
因为 Mac 跟 Ubuntu 上有些模块的表现形式不一样，所以需要移除 `node_module` 文件夹及其下所有内容，进行重新安装。又因为挂载的目录下修改文件，会对真实文件产生同样的更改。所以，将其移到至新的目录。
* 创建新目录：
```shell
mkdir /app/docker/
```
* 复制项目：
```shell
cp -r /app/messageCenter/ /app/docker/
```
* 删除原模块
```shell
rm -rf /app/docker/node_moudle/
```
#### 5. 配置项目
* 安装内部模块，移至项目目录下 : 
 ```shell
 snpm install
 ```
* 安装其它模块：
```shell
npm install
```
* 编译环境：
```shell
make config-dev
```
#### 6. 全局安装 bunyan 与运行
* 安装 bunyan:
```shell
npm install -g bunyan
```
* 运行：
```shell
node app | bunyan
```
## 坑
本来，准备写一些安装过程中遇到的各种坑。实在太晚了，基本上的坑都在上文中写完了。都是 Ubuntu 镜像太基础了，没有”任何“现成命令。

## 关于加速
* apt-get 的加速
```shell
cd /etc/apt/
mv sources.list sources.list.bak
curl -O http://mirrors.163.com/.help/sources.list.precise
mv sources.list.precise sources.list
```
* npm 加速
```shell
alias cnpm="npm --registry=https://registry.npm.taobao.org \
# --cache=$HOME/.npm/.cache/cnpm \
# --disturl=https://npm.taobao.org/dist \
# --userconfig=$HOME/.cnpmrc"
```
## 关于保存镜像
将启动的容器一路配置到开发环境是件不太”容易“且费时的事。所以，最好在配置完成之后，进行一次打包，使之生成新的镜像。
```shell
docker commit b23 msgserver/base:1
```
b23 ： 为生成窗口的 ID 前三位
后面的参数为生成的新镜像命名。
## 关于体积
可以观察，生成的镜像的体积无比巨大(跟原始镜像相比)。
