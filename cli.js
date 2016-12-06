#!/usr/bin/env node

'use strict'

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const { version, name } = require('./package')
const args = process.argv.slice(2)

if (args[0] === '--help' || args[0] === '-h') showHelp()
else if (args[0] === '--version' || args[0] === '-v') showVersion()
else main()

function main () {
  const cwd = process.cwd()
  const nodeModulesDir = './node_modules'
  const packageJson = './package.json'
  const nodeModulesBin = path.join(nodeModulesDir, '.bin')
  const overwrite = args.indexOf('--overwrite') >= 0

  if (!fs.existsSync(nodeModulesDir)) return errorAndExit(`\n  Can't find ${nodeModulesDir}.`)
  if (!fs.existsSync(nodeModulesDir)) return errorAndExit(`\n  Can't find ${packageJson}.`)

  function processMod (dir, mod) {
    const pkgFile = path.join(dir, mod, 'package.json')
    let pkgJson
    try {
      pkgJson = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
    } catch (err) {
      return console.error(`Can't find ${pkgFile} or problem parsing it.`)
    }

    if (!pkgJson.bin) return

    const linkBin = (binName, relTarget) => {
      let p = path.join(nodeModulesBin, binName)
      let absP = path.join(cwd, p)
      let absPexists = fs.existsSync(absP)
      let target = path.join(path.relative(nodeModulesBin, path.join(dir, mod)), relTarget)

      if (absPexists && overwrite) fs.unlinkSync(absP)
      if (absPexists && !overwrite) return console.log(`  ${chalk.blue(p)} exists. Skipping.`)

      process.chdir(nodeModulesBin)
      fs.symlinkSync(target, absP, 'file')
      process.chdir(cwd)

      console.log(`  ${chalk.green(target)} => ${chalk.blue(p)}`)
    }

    if (typeof pkgJson.bin === 'object') {
      Object.keys(pkgJson.bin).forEach(binName => {
        linkBin(binName, pkgJson.bin[binName])
      })
    } else if (typeof pkgJson.bin === 'string') {
      linkBin(mod, pkgJson.bin)
    } else {
      console.error(chalk.red(`Unknown package.json bin type for module: ${mod}.`))
    }
  }

  console.log('')
  fs.readdirSync(nodeModulesDir).forEach(mod => {
    if (mod === '.bin') return
    if (mod === '.DS_Store') return // ignore Mac OS folder attributes file (such as icon position)

    // handle scoped modules
    if (mod.startsWith('@')) {
      fs.readdirSync(path.join(nodeModulesDir, mod)).forEach(scopeMod => {
        const dir = path.join(nodeModulesDir, mod)
        processMod(dir, scopeMod)
      })
      return
    }

    processMod(nodeModulesDir, mod)
  })

  console.log('')
  console.log('  done.')
  console.log('')
}

function errorAndExit (msg) {
  console.error(chalk.red(msg))
  return setImmediate(() => process.exit(1))
}

function showHelp () {
  console.log('')
  console.log(`  ${chalk.blue(name)}@${chalk.green(version)}`)
  console.log('')
  console.log(`    Run on project source directory with ${chalk.bold('package.json')} and ${chalk.bold('node_modules.')}`)
  console.log('')
  console.log('    options:')
  console.log('')
  console.log('      --overwrite Overwrite existing symlinks.')
  console.log('')
}

function showVersion () {
  console.log(version)
}
