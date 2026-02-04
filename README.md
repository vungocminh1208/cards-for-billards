# CARD-GAME – Tool Siêu Cúp Billiards 🎱

## 📌 Tổng quan
**CARD-GAME** là một công cụ phục vụ cho **Siêu Cúp Billiards**, bao gồm:
- **Backend**: xử lý logic, API
- **Client**: giao diện người dùng

Dự án được tách riêng backend và client để dễ phát triển, bảo trì và mở rộng.

---

## 📁 Cấu trúc dự án

CARD-GAME
│
├── backend/ # Backend Node.js
│ └── server.js
│
├── src/ # Source code client
├── .angular/
├── node_modules/
│
├── index.html
├── index.tsx
├── angular.json
├── tsconfig.json
├── metadata.json
│
├── .env.local
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

## Chạy Backend
cd backend
npm install
node server.js

## Chạy Frotend
npm install
npm run dev
