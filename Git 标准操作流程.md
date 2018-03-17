## git 的标准操作流程（指新建开发分支、仓库)

## 一、 远程
#### 1. 创建仓库，既远程分支

```shell
git init NewProject
```
此时创建了一个空仓库，并没有任何东西，甚至连分支都没有

#### 2. 创建分支


## 二、 本地
#### 1. 克隆仓库
```shell
git clone NewProjectGitAddress
```
#### 2. 创建本地分支

## 三、 项目创建好后的新建分支进行开发流程
#### 1. 从 `remote/origin/develop` 更新本地  `develop` 分支
```shell
git pull develop
```
#### 2. 从本地 `develop` 分支检出新分支 
```shell
git checkout -b NewBranch ...
```
#### 3. 切换到新建的分支上去
```shell
```
#### 4. 映射到远程相同分支，更改分支提交源
```shell
git --set-upstream origin:NewBranch
git -u push 
```
#### 5. 进行相关代码开发，并提交 
```shell
git add .
git commit -m "feat: ..."
git push
```

#### 6. 开发完成之后，提交合并 `MR` 请求

#### 7. 删除本地 `NewBranch` 分支
1. 切换到 `develop` 等其他分支

2. 删除开发、合并完成的 `NewBranch` 分支
```shell
git branch -d NewBranch
```
