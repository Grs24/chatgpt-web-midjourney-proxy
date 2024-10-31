/* eslint-disable no-console */
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)

// 设置所有必要的参数
const DOCKER_REGISTRY = 'registry.cn-shenzhen.aliyuncs.com'
const DOCKER_NAMESPACE = 'bihupiaodian'
const IMAGE_NAME = 'chatgpt-midjourney-web'
const DOCKER_USERNAME = 'rongsheng@comliq'
const DOCKER_PASSWORD = 'bihukeji2024'

// 生成 TAG_NAME
const generateTagName = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}-${hour}-${minute}-${second}`
}

// 获取最新构建的镜像标签
const getLatestImageTag = async () => {
  const fullImageName = `${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}`
  const command = `docker images ${fullImageName} --format "{{.Tag}}"`
  try {
    const { stdout } = await execPromise(command)
    const tags = stdout.trim().split('\n')
    if (tags.length === 0)
      throw new Error('No image found. Please build the image first.')

    // 过滤掉 'latest' 标签，并按时间戳排序
    const sortedTags = tags.filter(tag => tag !== 'latest')
      .sort((a, b) => b.localeCompare(a))
    return sortedTags[0] // 返回最新的标签
  }
  catch (error) {
    console.error('Error getting latest image tag:', error.message)
    throw error
  }
}

// 打印当前时间的函数
const printCurrentTime = (message) => {
  const now = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Shanghai' })
  console.log(`${now} ${message}`)
}

// 执行命令并检查结果
const executeCommand = async (command, errorMessage) => {
  try {
    console.log(`Executing: ${command.replace(DOCKER_PASSWORD, '********')}`)
    const { stdout, stderr } = await execPromise(command, { maxBuffer: 1024 * 1024 * 10 })
    if (stderr)
      console.error(`Warning: ${stderr}`)
    return stdout.trim()
  }
  catch (error) {
    console.error(`Error: ${errorMessage}`)
    console.error(`Details: ${error.message}`)
    throw error
  }
}

// 构建 Docker 镜像
const buildImage = async () => {
  const tagName = generateTagName()
  printCurrentTime('开始构建 Docker 镜像')
  const fullImageName = `${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:${tagName}`
  try {
    await executeCommand(`docker build -t ${fullImageName} .`, 'Docker 镜像构建失败')
    await executeCommand(`docker tag ${fullImageName} ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:latest`, '给镜像打latest标签失败')
    printCurrentTime('Docker 镜像构建完成')
    console.log(`Built image tag: ${tagName}`)
  }
  catch (error) {
    console.error('Docker 镜像构建失败，尝试重新拉取基础镜像...')
    await executeCommand('docker pull node:lts-alpine', '拉取基础镜像失败')
    await executeCommand(`docker build -t ${fullImageName} .`, '再次尝试构建 Docker 镜像失败')
    await executeCommand(`docker tag ${fullImageName} ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:latest`, '给镜像打latest标签失败')
    printCurrentTime('Docker 镜像构建完成（重试成功）')
    console.log(`Built image tag: ${tagName}`)
  }
}

// 推送镜像到阿里云
const pushImage = async () => {
  printCurrentTime('开始推送镜像到阿里云')
  const tagName = await getLatestImageTag()
  console.log(`Pushing image with tag: ${tagName}`)

  // 登录到阿里云 Docker 仓库
  await executeCommand(`docker login --username ${DOCKER_USERNAME} --password ${DOCKER_PASSWORD} ${DOCKER_REGISTRY}`, '登录到阿里云 Docker 仓库失败')

  // 推送镜像
  const fullImageName = `${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}`
  await executeCommand(`docker push ${fullImageName}:${tagName}`, '推送镜像到阿里云失败')
  await executeCommand(`docker push ${fullImageName}:latest`, '推送latest标签镜像到阿里云失败')

  printCurrentTime('镜像推送完成')
}

// 清理本地镜像
const cleanupImages = async () => {
  printCurrentTime('开始清理本地镜像')
  const tagName = await getLatestImageTag()
  const fullImageName = `${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}`
  await executeCommand(`docker rmi ${fullImageName}:${tagName}`, '清理本地镜像失败')
  await executeCommand(`docker rmi ${fullImageName}:latest`, '清理本地latest镜像失败')
  printCurrentTime('本地镜像清理完成')
}

// 主函数
async function main() {
  try {
    printCurrentTime('脚本开始执行')

    // 根据命令行参数执行不同的操作
    const args = process.argv.slice(2)
    if (args.includes('build'))
      await buildImage()

    if (args.includes('push'))
      await pushImage()

    if (args.includes('clean'))
      await cleanupImages()

    if (args.length === 0) {
      // 如果没有参数，执行所有步骤
      await buildImage()
      await pushImage()
      await cleanupImages()
    }

    printCurrentTime('脚本执行完成')
  }
  catch (error) {
    console.error('脚本执行失败:', error.message)
    process.exit(1)
  }
}

main()
