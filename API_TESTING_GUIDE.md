# API Testing Guide - Product & Review System

## Base URL

```
http://localhost:3001/api
```

## Authentication Headers

### For Admin Endpoints

```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

### For Authenticated User Endpoints

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

### For Public Endpoints

No authentication required

---

## Product Endpoints

### 1. Get All Products

**Endpoint:** `GET /api/products`

**Query Parameters:**

```
page=1              // Page number
limit=12            // Items per page
category=Electronics // Filter by category
search=laptop       // Search in name/description
```

**Example Request:**

```
GET http://localhost:3001/api/products?page=1&limit=12&category=Electronics&search=laptop
```

**Response:**

```json
{
  "success": true,
  "products": [
    {
      "_id": "123abc",
      "name": "Laptop",
      "description": "High performance laptop",
      "price": 999.99,
      "category": "Electronics",
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "publicId": "products/abc123"
        }
      ],
      "stock": 50,
      "rating": 4.5,
      "reviewCount": 10,
      "createdBy": "admin_id"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

---

### 2. Get Product By ID

**Endpoint:** `GET /api/products/:id`

**Example Request:**

```
GET http://localhost:3001/api/products/123abc
```

**Response:**

```json
{
  "success": true,
  "product": {
    "_id": "123abc",
    "name": "Laptop",
    "description": "High performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "images": [ ... ],
    "stock": 50,
    "rating": 4.5,
    "reviewCount": 10,
    "createdBy": {
      "_id": "admin_id",
      "name": "Admin Name"
    }
  }
}
```

---

### 3. Get Product Categories

**Endpoint:** `GET /api/products/categories`

**Example Request:**

```
GET http://localhost:3001/api/products/categories
```

**Response:**

```json
{
  "success": true,
  "categories": ["Electronics", "Clothing", "Home", "Books"]
}
```

---

### 4. Create Product (Admin Only)

**Endpoint:** `POST /api/products`

**Headers:**

```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with long battery life",
  "price": 29.99,
  "category": "Electronics",
  "stock": 100
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 29.99,
    "category": "Electronics",
    "stock": 100
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": { ... }
}
```

---

### 5. Update Product (Admin Only)

**Endpoint:** `PUT /api/products/:id`

**Headers:**

```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Wireless Mouse Pro",
  "price": 39.99,
  "stock": 75
}
```

**Response:**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": { ... }
}
```

---

### 6. Delete Product (Admin Only)

**Endpoint:** `DELETE /api/products/:id`

**Headers:**

```
Authorization: Bearer {admin_token}
```

**Example Request:**

```
DELETE http://localhost:3001/api/products/123abc
```

**Response:**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 7. Upload Product Images (Admin Only)

**Endpoint:** `POST /api/products/:id/images`

**Headers:**

```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Form Data:**

```
files: [file1.jpg, file2.jpg]  // Array of image files, max 4
```

**Example cURL:**

```bash
curl -X POST http://localhost:3001/api/products/123abc/images \
  -H "Authorization: Bearer admin_token" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg"
```

**Response:**

```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "images": [
    {
      "url": "https://res.cloudinary.com/.../abc123.jpg",
      "publicId": "products/abc123"
    }
  ]
}
```

---

### 8. Delete Product Image (Admin Only)

**Endpoint:** `DELETE /api/products/:id/images`

**Headers:**

```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "publicId": "products/abc123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## Review Endpoints

### 1. Create Review (Authenticated User)

**Endpoint:** `POST /api/reviews`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**For Product Review:**

```json
{
  "rating": 4,
  "comment": "Great product, very satisfied with the quality!",
  "reviewType": "product",
  "productId": "123abc"
}
```

**For Professional Review:**

```json
{
  "rating": 5,
  "comment": "Excellent service, highly recommended!",
  "reviewType": "professional",
  "professionalId": "prof_123"
}
```

**Example cURL (Product):**

```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Authorization: Bearer user_token" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Great product!",
    "reviewType": "product",
    "productId": "123abc"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Review created successfully",
  "review": {
    "_id": "review_123",
    "rating": 4,
    "comment": "Great product!",
    "reviewType": "product",
    "product": "123abc",
    "reviewer": "user_123",
    "createdAt": "2024-04-24T10:00:00Z"
  }
}
```

---

### 2. Get Product Reviews

**Endpoint:** `GET /api/reviews/product/:productId`

**Query Parameters:**

```
page=1      // Page number
limit=10    // Reviews per page
```

**Example Request:**

```
GET http://localhost:3001/api/reviews/product/123abc?page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "reviews": [
    {
      "_id": "review_123",
      "rating": 4,
      "comment": "Great product!",
      "reviewType": "product",
      "reviewer": {
        "_id": "user_123",
        "name": "John Doe",
        "image": "avatar_url"
      },
      "createdAt": "2024-04-24T10:00:00Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 3,
    "total": 25
  }
}
```

---

### 3. Get Professional Reviews

**Endpoint:** `GET /api/reviews/professional/:professionalId`

**Query Parameters:**

```
page=1      // Page number
limit=10    // Reviews per page
```

**Example Request:**

```
GET http://localhost:3001/api/reviews/professional/prof_123?page=1&limit=10
```

**Response:** (Same format as product reviews)

---

### 4. Delete Review (Authenticated User)

**Endpoint:** `DELETE /api/reviews/:id`

**Headers:**

```
Authorization: Bearer {user_token}
```

**Requirements:**

- Must be review author or admin
- Soft delete (sets isActive: false)

**Example Request:**

```
DELETE http://localhost:3001/api/reviews/review_123
```

**Response:**

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

### 5. Get All Reviews (Admin Only)

**Endpoint:** `GET /api/reviews`

**Headers:**

```
Authorization: Bearer {admin_token}
```

**Query Parameters:**

```
page=1              // Page number
limit=20            // Reviews per page
reviewType=product  // Filter: 'product' or 'professional' (optional)
```

**Example Request:**

```
GET http://localhost:3001/api/reviews?page=1&limit=20&reviewType=product
```

**Response:**

```json
{
  "success": true,
  "reviews": [
    {
      "_id": "review_123",
      "rating": 4,
      "comment": "Great product!",
      "reviewType": "product",
      "product": { ... },
      "reviewer": { ... },
      "createdAt": "2024-04-24T10:00:00Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 10,
    "total": 200
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error or missing required fields"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication token missing or invalid"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Product/Review not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "You have already reviewed this product"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing Workflow

### 1. Test Product Creation

```bash
# Create product
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"Test","price":10,"category":"Test","stock":100}'

# Save the product ID
```

### 2. Test Image Upload

```bash
# Upload images to the product
curl -X POST http://localhost:3001/api/products/{product_id}/images \
  -H "Authorization: Bearer admin_token" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg"
```

### 3. Test Product Retrieval

```bash
# Get all products
curl http://localhost:3001/api/products

# Get single product
curl http://localhost:3001/api/products/{product_id}
```

### 4. Test Review Submission

```bash
# Create review
curl -X POST http://localhost:3001/api/reviews \
  -H "Authorization: Bearer user_token" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Excellent product!","reviewType":"product","productId":"{product_id}"}'
```

### 5. Test Review Retrieval

```bash
# Get reviews for product
curl http://localhost:3001/api/reviews/product/{product_id}
```

### 6. Verify Rating Update

```bash
# Check if product rating was updated
curl http://localhost:3001/api/products/{product_id}
# Should show "rating": 5, "reviewCount": 1
```

---

## Environment Variables Needed

Ensure your `.env` file contains:

```
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Postman Collection Example

You can import these into Postman:

**Create Products Tab:**

- URL: `POST http://localhost:3001/api/products`
- Auth: Bearer Token (admin_token)
- Body: Raw JSON with product data

**Get Products Tab:**

- URL: `GET http://localhost:3001/api/products?page=1&limit=12`
- Auth: None

**Upload Images Tab:**

- URL: `POST http://localhost:3001/api/products/{{productId}}/images`
- Auth: Bearer Token (admin_token)
- Body: form-data with files

**Create Review Tab:**

- URL: `POST http://localhost:3001/api/reviews`
- Auth: Bearer Token (user_token)
- Body: Raw JSON with review data

---

Ready to test! 🚀
