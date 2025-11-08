import { describe, it, beforeAll, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

describe('OpenAPI contract basic checks', () => {
  let doc: any
  beforeAll(() => {
    const file = path.resolve(__dirname, '../openapi/devpro-tasks.yaml')
    const text = fs.readFileSync(file, 'utf8')
    doc = yaml.load(text)
  })

  it('has /tasks path defined', () => {
    expect(doc.paths).toBeDefined()
    expect(doc.paths['/tasks']).toBeDefined()
  })

  it('defines Task schema', () => {
    expect(doc.components).toBeDefined()
    expect(doc.components.schemas.Task).toBeDefined()
    expect(doc.components.schemas.CreateTaskInput).toBeDefined()
    expect(doc.components.schemas.UpdateTaskStatusInput).toBeDefined()
  })
})
