## 更新版本代码

执行 `npm run upstream` 更新 `main` 分支代码后同步到 `master`

## docker打包上传步骤

1.登录 Docker:

```base
docker login
```

2.构建新的 Docker 镜像：

```base
docker build -t grs24/chatgpt-midjourney-web:latest .
```

3.推送镜像到 Docker Hub：

```base
docker push grs24/chatgpt-midjourney-web:latest
```

## 更新 chatgpt-midjourney-web 版本

1.停止 chatgpt-midjourney-web 服务

```base
docker-compose stop chatgpt-midjourney-web
```

2.拉取最新镜像

```base
docker-compose pull chatgpt-midjourney-web
```

2.启动并重新创建服务

```base
docker-compose up -d --no-deps --build chatgpt-midjourney-web
```

## 常用 docker 命令

1.停止并移除旧的容器

```base
docker-compose down
```

2.启动新容器：

```base
docker-compose up -d
```
