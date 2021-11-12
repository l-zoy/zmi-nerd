import type { Config } from '@jest/types'
import path from 'path'
import fs from 'fs'

import { ITestArgs } from './types'

export default function defaultConfig(cwd: string, args: ITestArgs): Config.ConfigGlobals {
  const testMatchTypes = ['spec', 'test']
  const hasSrc = fs.existsSync(path.join(cwd, 'src'))

  const hasPackage = args.package
  const testMatchPrefix = hasPackage ? `**/packages/${args.package}/` : ''

  return {
    bail: 1,
    collectCoverageFrom: [
      'index.{js,jsx,ts,tsx}',
      hasSrc && 'src/**/*.{js,jsx,ts,tsx}',
      !args.package && 'packages/*/src/**/*.{js,jsx,ts,tsx}',
      args.package && `packages/${args.package}/src/**/*.{js,jsx,ts,tsx}`,
      '!**/node_modules/**',
      '!**/fixtures/**',
      '!**/__test__/**',
      '!**/examples/**',
      '!**/typings/**',
      '!**/types/**',
      '!**/*.d.ts'
    ].filter(Boolean),
    testPathIgnorePatterns: ['/node_modules/'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    testMatch: [`${testMatchPrefix}**/?*.(${testMatchTypes.join('|')}).(j|t)s?(x)`],
    transform: {
      '^.+\\.(j|t)sx?$': require.resolve('./jestTransformer')
    },
    verbose: true
  }
}
