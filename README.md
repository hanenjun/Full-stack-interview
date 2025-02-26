# Full Stack Interview Quiz

这是一个基于Vue 3和NestJS的全栈应用，实现了一个简单的聊天界面，包含记忆访问控制功能。

## 功能特点

- 展示聊天消息（机器人/用户）
- 显示记忆访问请求信息
- 支持批准/拒绝记忆访问请求
- 实时消息更新
- 响应式设计

## 本地运行指南

### 前置要求

- Node.js (推荐 v16 或更高版本)
- pnpm (推荐使用 pnpm 作为包管理器)

### 后端服务 (me)

1. 进入后端目录：
   ```bash
   cd me
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 启动开发服务器：
   ```bash
   pnpm run start:dev
   ```

服务器将在 http://localhost:3000 运行

### 前端应用 (fe)

1. 进入前端目录：
   ```bash
   cd fe
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 启动开发服务器：
   ```bash
   pnpm run dev
   ```

应用将在 http://localhost:5173 运行

## 使用说明

1. 启动后端服务和前端应用
2. 访问 http://localhost:5173
3. 页面将显示默认的聊天内容，包含一个记忆访问请求
4. 点击 "Approve" 或 "Reject" 按钮来响应记忆访问请求
5. 观察页面更新，显示相应的响应消息

## 技术栈

### 前端
- Vue 3
- TypeScript
- Vite

### 后端
- NestJS
- TypeScript