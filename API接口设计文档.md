# API 接口设计文档

## 📋 API 概述

- **基础 URL**: `https://api.cypridina.com/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **响应格式**: 统一的 JSON 结构

---

## 🔐 认证接口

### 1. 用户注册
```
POST /auth/register
Content-Type: application/json

请求体:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三",
  "company": "公司名称"
}

响应 (201):
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "张三",
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2. 用户登录
```
POST /auth/login
Content-Type: application/json

请求体:
{
  "email": "user@example.com",
  "password": "password123"
}

响应 (200):
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "张三",
    "role": "salesman",
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

### 3. 刷新 Token
```
POST /auth/refresh
Authorization: Bearer {refreshToken}

响应 (200):
{
  "code": 0,
  "data": {
    "token": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

### 4. 用户登出
```
POST /auth/logout
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "message": "登出成功"
}
```

---

## 📦 销售单接口

### 1. 创建销售单
```
POST /sales/invoices
Authorization: Bearer {token}
Content-Type: application/json

请求体:
{
  "customerId": "uuid",
  "date": "2025-10-25",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "unitPrice": 100
    }
  ],
  "notes": "备注"
}

响应 (201):
{
  "code": 0,
  "data": {
    "id": "uuid",
    "invoiceNo": "INV-20251025-001",
    "customerId": "uuid",
    "date": "2025-10-25",
    "total": 1000,
    "status": "draft",
    "items": [...],
    "createdAt": "2025-10-25T10:00:00Z"
  }
}
```

### 2. 获取销售单列表
```
GET /sales/invoices?page=1&limit=20&status=draft&customerId=uuid
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 3. 获取销售单详情
```
GET /sales/invoices/{id}
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "id": "uuid",
    "invoiceNo": "INV-20251025-001",
    "customer": {...},
    "items": [...],
    "total": 1000,
    "status": "draft",
    "createdAt": "2025-10-25T10:00:00Z"
  }
}
```

### 4. 更新销售单
```
PUT /sales/invoices/{id}
Authorization: Bearer {token}
Content-Type: application/json

请求体:
{
  "customerId": "uuid",
  "date": "2025-10-25",
  "items": [...],
  "notes": "备注"
}

响应 (200):
{
  "code": 0,
  "data": {...}
}
```

### 5. 删除销售单
```
DELETE /sales/invoices/{id}
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "message": "删除成功"
}
```

### 6. 提交销售单
```
POST /sales/invoices/{id}/submit
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "status": "submitted"
  }
}
```

---

## 👥 客户接口

### 1. 创建客户
```
POST /customers
Authorization: Bearer {token}
Content-Type: application/json

请求体:
{
  "name": "客户名称",
  "phone": "13800138000",
  "email": "customer@example.com",
  "category": "VIP",
  "creditLimit": 10000,
  "address": "地址"
}

响应 (201):
{
  "code": 0,
  "data": {...}
}
```

### 2. 获取客户列表
```
GET /customers?page=1&limit=20&search=keyword
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 3. 获取客户详情
```
GET /customers/{id}
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "id": "uuid",
    "name": "客户名称",
    "phone": "13800138000",
    "totalSales": 50000,
    "invoiceCount": 10,
    "lastPurchaseDate": "2025-10-20",
    "salesHistory": [...]
  }
}
```

### 4. 更新客户
```
PUT /customers/{id}
Authorization: Bearer {token}
Content-Type: application/json

响应 (200):
{
  "code": 0,
  "data": {...}
}
```

### 5. 删除客户
```
DELETE /customers/{id}
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 📦 产品接口

### 1. 创建产品
```
POST /products
Authorization: Bearer {token}
Content-Type: application/json

请求体:
{
  "name": "产品名称",
  "sku": "SKU-001",
  "category": "分类",
  "unitPrice": 100,
  "stock": 1000,
  "unit": "件",
  "specs": "规格说明"
}

响应 (201):
{
  "code": 0,
  "data": {...}
}
```

### 2. 获取产品列表
```
GET /products?page=1&limit=20&category=分类
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 3. 获取产品详情
```
GET /products/{id}
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "id": "uuid",
    "name": "产品名称",
    "sku": "SKU-001",
    "unitPrice": 100,
    "stock": 1000,
    "salesCount": 500,
    "totalSales": 50000
  }
}
```

### 4. 更新产品
```
PUT /products/{id}
Authorization: Bearer {token}
Content-Type: application/json

响应 (200):
{
  "code": 0,
  "data": {...}
}
```

### 5. 删除产品
```
DELETE /products/{id}
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 📊 报表接口

### 1. 销售报表
```
GET /reports/sales?startDate=2025-10-01&endDate=2025-10-31&groupBy=day
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "totalSales": 100000,
    "totalInvoices": 50,
    "averageOrderValue": 2000,
    "dailyData": [
      {
        "date": "2025-10-01",
        "sales": 5000,
        "invoices": 5
      }
    ]
  }
}
```

### 2. 客户分析
```
GET /reports/customers?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "totalCustomers": 100,
    "newCustomers": 10,
    "topCustomers": [
      {
        "id": "uuid",
        "name": "客户名称",
        "totalSales": 50000
      }
    ]
  }
}
```

### 3. 产品分析
```
GET /reports/products?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "topProducts": [
      {
        "id": "uuid",
        "name": "产品名称",
        "salesCount": 500,
        "totalSales": 50000
      }
    ]
  }
}
```

---

## 📤 导出接口

### 1. 导出销售单为 PDF
```
GET /sales/invoices/{id}/export/pdf
Authorization: Bearer {token}

响应: PDF 文件
```

### 2. 导出销售单为 Excel
```
GET /sales/invoices/export/excel?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {token}

响应: Excel 文件
```

---

## 🔄 库存接口

### 1. 获取库存
```
GET /inventory/products/{productId}
Authorization: Bearer {token}

响应 (200):
{
  "code": 0,
  "data": {
    "productId": "uuid",
    "quantity": 1000,
    "reserved": 100,
    "available": 900
  }
}
```

### 2. 库存调整
```
POST /inventory/adjust
Authorization: Bearer {token}
Content-Type: application/json

请求体:
{
  "productId": "uuid",
  "quantity": 100,
  "reason": "盘点调整"
}

响应 (200):
{
  "code": 0,
  "data": {...}
}
```

---

## 📝 错误响应格式

```json
{
  "code": 400,
  "message": "请求参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}
```

---

## 🔑 HTTP 状态码

- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器错误

---

## 📚 认证示例

```javascript
// 请求头
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 刷新 Token
POST /auth/refresh
Authorization: Bearer {refreshToken}
```

