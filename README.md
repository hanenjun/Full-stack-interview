# Full Stack Interview Quiz

[English](#english) | [中文](#chinese)

<a name="english"></a>

## Overview

This is a full-stack application built with Vue 3 and NestJS, implementing a simple chat interface with memory access control functionality.

## Features

- Display chat messages (bot/user)
- Show memory access request information
- Support approving/rejecting memory access requests
- Real-time message updates
- Responsive design
- MetaMask wallet integration
- EIP712 signature support

## Local Development Guide

### Prerequisites

- Node.js (v16 or higher recommended)
- pnpm (recommended as package manager)
- MetaMask wallet extension installed in browser

### Backend Service (me)

1. Navigate to backend directory:
   ```bash
   cd me
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start development server:
   ```bash
   pnpm run start:dev
   ```

The server will run at http://localhost:3000

### Frontend Application (fe)

1. Navigate to frontend directory:
   ```bash
   cd fe
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start development server:
   ```bash
   pnpm run dev
   ```

The application will run at http://localhost:5173

## Usage Instructions

1. Start both backend service and frontend application
2. Visit http://localhost:5173
3. Connect your MetaMask wallet by clicking the "Connect Wallet" button
4. Sign the message using EIP712 when prompted
5. The page will display default chat content, including a memory access request
6. Click "Approve" or "Reject" buttons to respond to memory access requests
7. Observe page updates showing corresponding response messages

## Tech Stack

### Frontend
- Vue 3
- TypeScript
- Vite

### Backend
- NestJS
- TypeScript

---

<a name="chinese"></a>

## 概述

这是一个基于Vue 3和NestJS的全栈应用，实现了一个简单的聊天界面，包含记忆访问控制功能。

## 功能特点

- 展示聊天消息（机器人/用户）
- 显示记忆访问请求信息
- 支持批准/拒绝记忆访问请求
- 实时消息更新
- 响应式设计
- MetaMask钱包集成
- EIP712签名支持

## 本地运行指南

### 前置要求

- Node.js (推荐 v16 或更高版本)
- pnpm (推荐使用 pnpm 作为包管理器)
- 浏览器安装 MetaMask 钱包扩展

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
3. 点击"连接钱包"按钮连接 MetaMask 钱包
4. 按提示使用 EIP712 签名消息
5. 页面将显示默认的聊天内容，包含一个记忆访问请求
6. 点击 "Approve" 或 "Reject" 按钮来响应记忆访问请求
7. 观察页面更新，显示相应的响应消息

## 技术栈

### 前端
- Vue 3
- TypeScript
- Vite

### 后端
- NestJS
- TypeScript