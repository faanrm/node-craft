import path from "path"
import fs from "fs-extra"
export class Template {
    private projectPath!: string
    constructor() { }
    async setupTemplate() {
        const templateDir = path.join(this.projectPath, 'templates')
        await fs.ensureDir(templateDir)
        const templates = [
            {
                name: "model-template.ts", content: await fs.readFile(path.join(__dirname, 'zod-model-template.ts'), 'utf-8'),
            },
            {

                name: "service-template.ts", content: await fs.readFile(path.join(__dirname, 'zod-service-template.ts'), 'utf-8')
            },
            {
                name: "controller-template.ts", content: await fs.readFile(path.join(__dirname, 'zod-controller-template.ts'), 'utf-8')
            },
            {
                name: "routes-template.ts", content: await fs.readFile(path.join(__dirname, 'routing-template.ts'), 'utf-8')
            },
            {
                name: 'validator-middleware.ts', content: await fs.readFile(path.join(__dirname, 'zod-middleware.ts'), 'utf-8')
            }
        ]
        for (const template of templates) {
            await fs.writeFile(
                path.join(templateDir, template.name),
                template.content
            )
        }
    }
    async codeTemplate() {
    }
}
