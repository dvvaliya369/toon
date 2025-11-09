export const examples = [
  {
    name: 'Simple Users',
    json: `{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" }
  ]
}`,
    toon: `users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user`,
  },
  {
    name: 'E-commerce Orders',
    json: `{
  "orders": [
    {
      "orderId": "ORD-001",
      "customer": "Alice Johnson",
      "total": 299.99,
      "status": "shipped"
    },
    {
      "orderId": "ORD-002",
      "customer": "Bob Smith",
      "total": 149.50,
      "status": "pending"
    },
    {
      "orderId": "ORD-003",
      "customer": "Charlie Brown",
      "total": 599.00,
      "status": "delivered"
    }
  ]
}`,
    toon: `orders[3]{orderId,customer,total,status}:
  ORD-001,Alice Johnson,299.99,shipped
  ORD-002,Bob Smith,149.5,pending
  ORD-003,Charlie Brown,599,delivered`,
  },
  {
    name: 'Time-series Data',
    json: `{
  "metrics": [
    {
      "date": "2025-01-01",
      "views": 5715,
      "clicks": 211,
      "conversions": 28,
      "revenue": 7976.46
    },
    {
      "date": "2025-01-02",
      "views": 7103,
      "clicks": 393,
      "conversions": 28,
      "revenue": 8360.53
    },
    {
      "date": "2025-01-03",
      "views": 7248,
      "clicks": 378,
      "conversions": 24,
      "revenue": 3212.57
    }
  ]
}`,
    toon: `metrics[3]{date,views,clicks,conversions,revenue}:
  2025-01-01,5715,211,28,7976.46
  2025-01-02,7103,393,28,8360.53
  2025-01-03,7248,378,24,3212.57`,
  },
  {
    name: 'Nested Objects',
    json: `{
  "user": {
    "id": 123,
    "name": "Ada Lovelace",
    "profile": {
      "email": "ada@example.com",
      "age": 36
    }
  }
}`,
    toon: `user:
  id: 123
  name: Ada Lovelace
  profile:
    email: ada@example.com
    age: 36`,
  },
  {
    name: 'Mixed Array',
    json: `{
  "items": [
    { "sku": "A1", "qty": 2, "price": 9.99 },
    { "sku": "B2", "qty": 1, "price": 14.50 }
  ],
  "tags": ["electronics", "gadgets", "sale"]
}`,
    toon: `items[2]{sku,qty,price}:
  A1,2,9.99
  B2,1,14.5
tags[3]: electronics,gadgets,sale`,
  },
  {
    name: 'Employee Records',
    json: `{
  "employees": [
    {
      "id": 1001,
      "name": "Sarah Chen",
      "department": "Engineering",
      "salary": 95000,
      "active": true
    },
    {
      "id": 1002,
      "name": "Michael Rodriguez",
      "department": "Sales",
      "salary": 75000,
      "active": true
    },
    {
      "id": 1003,
      "name": "Emily Watson",
      "department": "Marketing",
      "salary": 68000,
      "active": false
    }
  ]
}`,
    toon: `employees[3]{id,name,department,salary,active}:
  1001,Sarah Chen,Engineering,95000,true
  1002,Michael Rodriguez,Sales,75000,true
  1003,Emily Watson,Marketing,68000,false`,
  },
  {
    name: 'GitHub Repositories',
    json: `{
  "repositories": [
    {
      "id": 28457823,
      "name": "freeCodeCamp",
      "stars": 430886,
      "forks": 42146,
      "language": "JavaScript"
    },
    {
      "id": 132750724,
      "name": "build-your-own-x",
      "stars": 430877,
      "forks": 40453,
      "language": "Markdown"
    },
    {
      "id": 21737465,
      "name": "awesome",
      "stars": 410052,
      "forks": 32029,
      "language": "Markdown"
    }
  ]
}`,
    toon: `repositories[3]{id,name,stars,forks,language}:
  28457823,freeCodeCamp,430886,42146,JavaScript
  132750724,build-your-own-x,430877,40453,Markdown
  21737465,awesome,410052,32029,Markdown`,
  },
  {
    name: 'Product Inventory',
    json: `{
  "products": [
    {
      "sku": "LAPTOP-001",
      "name": "ThinkPad X1",
      "price": 1299.99,
      "stock": 45,
      "category": "Electronics"
    },
    {
      "sku": "MOUSE-042",
      "name": "Wireless Mouse",
      "price": 29.99,
      "stock": 230,
      "category": "Accessories"
    },
    {
      "sku": "DESK-015",
      "name": "Standing Desk",
      "price": 599.00,
      "stock": 12,
      "category": "Furniture"
    }
  ]
}`,
    toon: `products[3]{sku,name,price,stock,category}:
  LAPTOP-001,ThinkPad X1,1299.99,45,Electronics
  MOUSE-042,Wireless Mouse,29.99,230,Accessories
  DESK-015,Standing Desk,599,12,Furniture`,
  },
]
