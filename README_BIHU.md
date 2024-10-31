# AI 项目 chatgpt-midjourney-web 开发文档

本项目是基于开源项目 [chatgpt-web-midjourney-proxy](https://github.com/Dooy/chatgpt-web-midjourney-proxy) 的二次开发。

## 开发注意事项

1. 为便于同步开源项目的迭代版本,尽量避免影响文件的改动,包括代码规范等。

2. 本地开发时需关闭页面路由的 session 校验:
   - 全局搜索 `setupPageGuard` 方法
   - 注释掉其中的校验逻辑
   - 直接调用 `next()`
   - 提交代码前记得恢复原状

3. **TODO**: 后续实现 GitLab CI/CD
   - 目前在 GitLab 中打包该项目的 Docker 镜像会出现拉取基础镜像超时等问题
   - 暂时使用本地打包并推送到阿里云镜像仓库的方式
   - 未来将通过 `.gitlab-ci.yml` 文件实现:
     - 提交代码到 `qa/master` 分支时自动推送镜像到阿里云镜像仓库
     - 仓库地址: [registry.cn-shenzhen.aliyuncs.com](https://cr.console.aliyun.com/cn-shenzhen/instance/repositories)
4. /bihu-bak 文件夹备份着相关的脚本

## 迭代版本流程

### 1. 打包发布（打包时先运行docker deskTop <https://www.docker.com/products/docker-desktop/）>

构建镜像并推送到阿里云私有镜像仓库:

##### 一键打包镜像并推送到阿里云

`node ./docker-deploy.js`

##### 单独打包 Docker 镜像

`node docker-deploy.js build`

##### 单独推送镜像到阿里云

`node docker-deploy.js push`

### 2. 在服务器拉取最新镜像并部署更新

1. 进入 QA 服务器:
`cd /home/bihu/prod-assets/chatgpt-midjourney-web`

2. 在项目目录中执行部署脚本:
`./deploy.sh`

该命令会:

- 登录阿里云
- 拉取最新镜像
- 执行项目下的 docker-compose.yml
- 重新部署服务
