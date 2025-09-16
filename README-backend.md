# 🎓 School Payment & Dashboard Backend (MERN - Node.js + Express + MongoDB)

This is the backend microservice for the **School Payment and Dashboard Application**.  
It handles payment gateway integration, transaction management, webhook updates, and secure APIs for frontend consumption.

---

## 🚀 Tech Stack
- **Node.js / Express.js**
- **MongoDB Atlas** (Mongoose ODM)
- **JWT Authentication**
- **Payment Gateway Integration** (Edviron PG API)
- **Aggregation Pipelines** for reporting & filtering

---

## ⚙️ Setup Instructions

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env` File
```env
PORT=5000
MONGO_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<your_jwt_secret>
PG_KEY=edvtest01
PG_SECRET=<your_pg_secret>
API_KEY=<your_pg_api_key>
BASE_URL=http://localhost:5000
```

### 4. Run Backend
```bash
npm run dev
```

---

## 🗂 Database Schemas

### Order Schema
```json
{
  "_id": "ObjectId",
  "school_id": "string",
  "trustee_id": "string",
  "student_info": {
    "name": "string",
    "id": "string",
    "email": "string"
  },
  "gateway_name": "string",
  "custom_order_id": "string"
}
```

### Order Status Schema
```json
{
  "_id": "ObjectId",
  "collect_id": "ObjectId (ref Order)",
  "order_amount": "number",
  "transaction_amount": "number",
  "payment_mode": "string",
  "payment_details": "string",
  "bank_reference": "string",
  "payment_message": "string",
  "status": "string",
  "error_message": "string",
  "custom_order_id": "string",
  "payment_time": "Date"
}
```

### Webhook Logs Schema
Stores webhook payloads for debugging/auditing.

---

## 🔐 Authentication
All APIs are secured using **JWT tokens**.  
- Generate token after login.  
- Pass token in `Authorization: Bearer <token>` header.  

---

## 🔗 API Endpoints

### 🔹 Payment Flow
- `POST /create-payment` → Create collect request & generate payment link.
- `GET /status/:collect_request_id?school_id=<id>` → Check transaction status from gateway.
- `POST /webhook` → Receive payment gateway callback & update order status.

### 🔹 Transactions
- `GET /transactions` → Paginated, filterable, sortable transactions list.  
  - Query params: `page`, `limit`, `search`, `status`, `school`, `startDate`, `endDate`, `sortField`, `sortOrder`.  
- `GET /transactions/school/:schoolId` → Transactions for a single school.  
- `GET /transaction-status/:custom_order_id` → Current status of a transaction.

---

## 🧪 Testing
- Use **Postman** or **Thunder Client**.  
- Simulate payments with provided sandbox credentials.  
- Test webhook by manually sending payloads to `POST /webhook`.

---

## ✅ Edge Cases Handled
- Invalid/missing JWT.  
- Invalid school_id or collect_request_id.  
- Payment failure or timeout.  
- Transactions without OrderStatus show as `"INITIATED"`.  
- Pagination and filters persist correctly.

---

## 📌 Notes
- Use **sandbox mode** for payment gateway.  
- Do **not** use real UPI IDs or bank accounts.  
