# API 测试指南

## 🧪 使用 Postman 测试 API

### 1. 导入环境变量

创建一个 Postman 环境，设置以下变量：

```json
{
  "baseUrl": "http://localhost:3000",
  "token": "",
  "refreshToken": ""
}
```

### 2. 认证流程

#### 注册

```
POST {{baseUrl}}/api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "用户名",
  "company": "公司名称"
}
```

响应：
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "用户名",
    "role": "admin",
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 3600
  }
}
```

#### 登录

```
POST {{baseUrl}}/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### 刷新 Token

```
POST {{baseUrl}}/api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}
```

#### 获取当前用户

```
GET {{baseUrl}}/api/v1/auth/me
Authorization: Bearer {{token}}
```

### 3. 销售单 API

#### 创建销售单

```
POST {{baseUrl}}/api/v1/sales
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "customerId": "customer-id",
  "invoiceDate": "2025-01-15",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "unitPrice": 1000
    }
  ],
  "notes": "备注"
}
```

#### 获取销售单列表

```
GET {{baseUrl}}/api/v1/sales?page=1&limit=20&status=draft
Authorization: Bearer {{token}}
```

#### 获取销售单详情

```
GET {{baseUrl}}/api/v1/sales/invoice-id
Authorization: Bearer {{token}}
```

#### 更新销售单

```
PUT {{baseUrl}}/api/v1/sales/invoice-id
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "customerId": "customer-id",
  "invoiceDate": "2025-01-15",
  "notes": "更新的备注"
}
```

#### 提交销售单

```
POST {{baseUrl}}/api/v1/sales/invoice-id/submit
Authorization: Bearer {{token}}
```

#### 删除销售单

```
DELETE {{baseUrl}}/api/v1/sales/invoice-id
Authorization: Bearer {{token}}
```

### 4. 客户 API

#### 创建客户

```
POST {{baseUrl}}/api/v1/customers
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "客户名称",
  "phone": "13800138000",
  "email": "customer@example.com",
  "category": "VIP",
  "creditLimit": 100000,
  "address": "地址"
}
```

#### 获取客户列表

```
GET {{baseUrl}}/api/v1/customers?page=1&limit=20&search=客户名
Authorization: Bearer {{token}}
```

#### 获取客户详情

```
GET {{baseUrl}}/api/v1/customers/customer-id
Authorization: Bearer {{token}}
```

#### 获取客户统计

```
GET {{baseUrl}}/api/v1/customers/customer-id/stats
Authorization: Bearer {{token}}
```

### 5. 产品 API

#### 创建产品

```
POST {{baseUrl}}/api/v1/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "产品名称",
  "sku": "SKU-001",
  "category": "电子产品",
  "unit": "件",
  "unitPrice": 1000,
  "costPrice": 600,
  "specs": "规格说明"
}
```

#### 获取产品列表

```
GET {{baseUrl}}/api/v1/products?page=1&limit=20
Authorization: Bearer {{token}}
```

#### 获取产品详情

```
GET {{baseUrl}}/api/v1/products/product-id
Authorization: Bearer {{token}}
```

### 6. 库存 API

#### 获取库存

```
GET {{baseUrl}}/api/v1/inventory/product-id
Authorization: Bearer {{token}}
```

#### 调整库存

```
POST {{baseUrl}}/api/v1/inventory/product-id/adjust
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "type": "in",
  "quantity": 100,
  "reason": "入库"
}
```

#### 设置预警级别

```
PUT {{baseUrl}}/api/v1/inventory/product-id/warning
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "warningLevel": 50
}
```

### 7. 报表 API

#### 获取销售报表

```
GET {{baseUrl}}/api/v1/reports/sales?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer {{token}}
```

#### 获取客户分析

```
GET {{baseUrl}}/api/v1/reports/customers
Authorization: Bearer {{token}}
```

#### 获取产品分析

```
GET {{baseUrl}}/api/v1/reports/products
Authorization: Bearer {{token}}
```

#### 获取仪表板数据

```
GET {{baseUrl}}/api/v1/reports/dashboard
Authorization: Bearer {{token}}
```

## 🔍 常见错误

### 401 Unauthorized

- 缺少 Token
- Token 已过期
- Token 无效

**解决方案**: 重新登录获取新的 Token

### 403 Forbidden

- 权限不足

**解决方案**: 检查用户角色

### 404 Not Found

- 资源不存在

**解决方案**: 检查资源 ID 是否正确

### 400 Bad Request

- 请求参数错误
- 验证失败

**解决方案**: 检查请求体格式和参数

## 📊 性能测试

使用 Apache Bench 进行性能测试：

```bash
# 测试 100 个请求，并发 10
ab -n 100 -c 10 -H "Authorization: Bearer {{token}}" http://localhost:3000/api/v1/sales
```

## 🐛 调试技巧

1. 查看服务器日志
2. 使用 Postman 的 Console 查看请求/响应
3. 使用浏览器开发者工具查看网络请求
4. 使用 VS Code 调试器设置断点

