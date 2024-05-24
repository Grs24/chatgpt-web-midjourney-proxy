const { exec } = require('child_process')

// 源仓库
const UPSTREAM_REPO = 'https://github.com/Dooy/chatgpt-web-midjourney-proxy.git'

const commands = [
  `git remote add upstream ${UPSTREAM_REPO}`,
  'git fetch upstream',
  'git stash push -m "Stashing local changes before updating from upstream"', // 暂存本地更改
  'git checkout main',
  'git merge upstream/main',
  'git stash pop', // 恢复本地更改
  'git add .', // 添加所有更改
]

const executeCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${cmd}\n`, error)
        return reject(error)
      }
      if (stdout)
        console.log(`stdout: ${stdout}`)
      if (stderr)
        console.error(`stderr: ${stderr}`)
      resolve()
    })
  })
}

const checkUpstreamExists = () => {
  return new Promise((resolve, reject) => {
    exec('git remote get-url upstream', (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes('No such remote'))
          resolve(false) // upstream 不存在
        else
          return reject(error) // 其他错误
      }
      else {
        resolve(true) // upstream 存在
      }
    })
  })
}

const runCommands = async () => {
  try {
    const upstreamExists = await checkUpstreamExists()
    if (!upstreamExists)
      await executeCommand(commands[0]) // 只在 upstream 不存在时添加

    for (let i = 1; i < commands.length; i++)
      await executeCommand(commands[i])
  }
  catch (error) {
    console.error(`Failed to execute command: ${error.cmd}\n`, error)
  }
}

runCommands()
