#!/usr/bin/env node

'use strict'

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const pkg = require('./package')
const args = process.argv.slice(2)

if (args[0] === '--help' || args[0] === '-h') showHelp()
else if (args[0] === '--version' || args[0] === '-v') showVersion()
else main()

function main () {
  const cwd = process.cwd()
  const nodeModulesDir = './node_modules'
  const packageJson = './package.json'
  const overwrite = args.indexOf('--overwrite') >= 0

  if (!fs.existsSync(nodeModulesDir)) {
    console.error(`\n  Can't find ${nodeModulesDir}.`)
    return setImmediate(() => process.exit(1))
  }

  if (!fs.existsSync(nodeModulesDir)) {
    console.error(`\n  Can't find ${packageJson}.`)
    return setImmediate(() => process.exit(1))
  }

  console.log('')
  fs.readdirSync(nodeModulesDir).forEach(mod => {
    if (mod === '.bin') return
    let pkgJson = JSON.parse(fs.readFileSync(path.join('node_modules', mod, 'package.json'), 'utf8'))
    if (!pkgJson.bin) return

    const nodeModulesBin = path.join(nodeModulesDir, '.bin')
    Object.keys(pkgJson.bin).forEach(binName => {
      let p = path.join(nodeModulesBin, binName)
      let absP = path.join(cwd, p)
      let absPexists = fs.existsSync(absP)
      let target = path.join(path.relative(nodeModulesBin, path.join(nodeModulesDir, mod)), pkgJson.bin[binName])

      if (absPexists && overwrite) fs.unlinkSync(absP)
      if (absPexists && !overwrite) return console.log(`  ${chalk.blue(p)} exists. Skipping.`)

      process.chdir(nodeModulesBin)
      fs.symlinkSync(target, absP, 'file')
      process.chdir(cwd)

      console.log(`  ${chalk.green(target)} => ${chalk.blue(p)}`)
    })
  })

  console.log('')
  console.log('  done.')
  console.log('')
}

function showHelp () {
  console.log('')
  console.log(`  ${chalk.blue(pkg.name)}@${chalk.green(pkg.version)}`)
  console.log('')
  console.log(`    Run on project source directory with ${chalk.bold('package.json')} and ${chalk.bold('node_modules.')}`)
  console.log('')
  console.log('    options:')
  console.log('')
  console.log('      --overwrite Overwrite existing symlinks.')
  console.log('')
}

function showVersion () {
  console.log(pkg.version)
}
