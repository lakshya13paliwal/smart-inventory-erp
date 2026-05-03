📦 Smart Inventory ERP

Smart Inventory ERP is a full-stack web application designed to manage inventory, suppliers, and sales efficiently. It helps businesses track stock in real time, analyze performance, and make data-driven decisions using a modern tech stack.

🚀 Features

* 📊 **Inventory Management** – Track products and stock levels
* 🏢 **Supplier Management** – Manage supplier details and relationships
* 💰 **Sales Tracking** – Monitor transactions and performance
* 📈 **Analytics Dashboard** – Visual insights for better decision-making
* 🔐 **Authentication System** – Secure user login and access
* 🤖 **Demand Forecasting** – Predict future inventory needs

🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **ORM:** Drizzle ORM
* **Authentication:** Passport.js

⚙️ Installation & Setup

1. Clone the repository

```bash
git clone https://github.com/lakshya13paliwal/smart-inventory-erp.git
cd smart-inventory-erp
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/smart_erp
SESSION_SECRET=secret
```

4. Setup database

```bash
npm run db:push
```

5. Run the project

```bash
npm run dev
```

---

🌐 Usage

Open your browser and go to:

```text
http://localhost:5000
```

---

📌 Notes

* Make sure PostgreSQL is installed and running
* Replace `YOUR_PASSWORD` with your PostgreSQL password
* `.env` file should not be shared publicly

---

📄 License

This project is for educational and development purposes.

---

👨‍💻 Author

Lakshya Paliwal

---
