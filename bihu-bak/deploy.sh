#!/bin/bash

# 警告: 在脚本中硬编码凭据可能存在安全风险。
# 请确保这个文件的访问权限得到适当的限制，并且不要将其提交到版本控制系统。

# 设置 Docker 凭证
DOCKER_USERNAME='rongsheng@comliq'
DOCKER_PASSWORD="bihukeji2024"

# 设置其他变量
DOCKER_REGISTRY="registry.cn-shenzhen.aliyuncs.com"
DOCKER_NAMESPACE="bihupiaodian"
IMAGE_NAME="chatgpt-midjourney-web"
TAG="latest"
FULL_IMAGE_NAME="${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:${TAG}"

# 颜色输出函数
print_color() {
    COLOR='\033[0;'"$1"'m'
    NC='\033[0m' # No Color
    echo -e "${COLOR}$2${NC}"
}

# 检查命令是否执行成功
check_result() {
    if [ $? -ne 0 ]; then
        print_color '31' "错误: $1"
        exit 1
    fi
}

# 主函数
main() {
    print_color '34' "开始部署流程..."

    # 登录到阿里云 Docker 仓库
    print_color '34' "正在登录到阿里云 Docker 仓库..."
    echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin "$DOCKER_REGISTRY"
    check_result "登录到阿里云 Docker 仓库失败"

    # 拉取最新镜像
    print_color '34' "正在拉取最新镜像: ${FULL_IMAGE_NAME}"
    docker pull $FULL_IMAGE_NAME
    check_result "拉取镜像失败"

    # 停止并删除旧容器（如果存在）
    print_color '34' "停止并删除旧容器（如果存在）..."
    docker-compose down

    # 启动新容器
    print_color '34' "正在启动新容器..."
    docker-compose up -d
    check_result "启动容器失败"

    print_color '32' "部署完成!"
}

# 运行主函数
main
