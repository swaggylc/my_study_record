const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = 'd:\\project\\vitepress_demo\\docs\\src';

// 递归获取所有 .md 文件
function getAllMdFiles(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = [...files, ...getAllMdFiles(fullPath)];
        } else if (entry.name.endsWith('.md')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// 为文件添加 frontmatter.date
function addDateFrontmatter(filePath) {
    try {
        // 获取文件的相对路径（相对于项目根目录）
        const relativePath = path.relative('d:\\project\\vitepress_demo', filePath);
        console.log(`Processing ${relativePath}...`);
        
        // 使用 git log 获取最后一次修改时间
        let lastModifiedDate;
        try {
            lastModifiedDate = execSync(`git log -1 --format="%aI" -- "${filePath}"`, {
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore']
            }).trim();
        } catch (error) {
            console.log(`  Warning: Could not get git history for ${relativePath}, skipping.`);
            return;
        }
        
        if (!lastModifiedDate) {
            console.log(`  Warning: No git history found for ${relativePath}, skipping.`);
            return;
        }
        
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否已有 frontmatter
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
        const hasFrontmatter = frontmatterRegex.test(content);
        
        if (hasFrontmatter) {
            // 检查是否已有 date 字段
            const hasDateField = content.match(frontmatterRegex)[1].includes('date:');
            
            if (hasDateField) {
                console.log(`  File already has frontmatter.date, skipping.`);
                return;
            }
            
            // 添加 date 字段到现有的 frontmatter
            const newContent = content.replace(frontmatterRegex, `---\n$1\ndate: "${lastModifiedDate}"\n---\n`);
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`  Added date: ${lastModifiedDate}`);
        } else {
            // 添加新的 frontmatter 和 date 字段
            const newContent = `---\ndate: "${lastModifiedDate}"\n---\n${content}`;
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`  Added frontmatter with date: ${lastModifiedDate}`);
        }
    } catch (error) {
        console.error(`  Error processing ${filePath}:`, error.message);
    }
}

// 主函数
function main() {
    try {
        // 检查是否有 Node.js 环境
        execSync('node --version', { stdio: 'ignore' });
        
        // 检查是否有 Git 环境
        execSync('git --version', { stdio: 'ignore' });
        
        // 获取所有 .md 文件
        const mdFiles = getAllMdFiles(SRC_DIR);
        console.log(`Found ${mdFiles.length} markdown files.`);
        
        // 为每个文件添加 frontmatter.date
        mdFiles.forEach(filePath => {
            addDateFrontmatter(filePath);
        });
        
        console.log('All files processed successfully!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();