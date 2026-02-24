## IoT Attendance API Service

Backend service for an IoT-based attendance system using a fingerprint sensor with an ESP8266.  
The API manages users (students/teachers), roles, fingerprint templates, courses, enrollments, and teaching assignments.

---

### Project structure

- **`server.js`**  
  - Entry point of the application.  
  - Connects to the database, runs automatic schema sync (`sequelize.sync({ alter: true })`), seeds default roles, and starts the HTTP server.

- **`app.js`**  
  - Express application configuration.  
  - Registers global middleware (e.g. `express.json()`).  
  - Mounts routes, e.g. `app.use('/auth', authRoutes)`.  
  - Health-check route: `GET /` → `"Service is active"`.

- **`src/config/database.js`**  
  - Central Sequelize configuration.  
  - Creates and exports the `sequelize` instance using environment variables (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_DIALECT`).

- **`src/models/`**  
  - **`index.js`** – loads all models, defines associations, and exports them together with `sequelize`.  
  - **`user.model.js`** – user entity (students and teachers), including `role_id`, `name`, `email`, `password`.  
  - **`role.model.js`** – role entity (e.g. `student`, `teacher`).  
  - **`fingerprintData.model.js`** – fingerprint templates linked to users (for ESP8266 sensor data).  
  - **`course.model.js`** – courses/subjects.  
  - **`enrollment.model.js`** – junction table for **students enrolled in courses**.  
  - **`teaching.model.js`** – junction table for **teachers assigned to courses**.

- **`src/routes/`**  
  - **`auth.route.js`** – routes under `/auth`, currently exposes a simple `GET /auth/` test endpoint.

- **`src/controllers/`**  
  - **`auth.controller.js`** – controller for auth-related endpoints (e.g. `sayHello` test handler).

---

### Environment configuration

Create a `.env` file in the project root with your database configuration:

```bash
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_DIALECT=mysql
PORT=3000
```

Make sure the database (`DB_NAME`) already exists in your MySQL instance before starting the service.

---

### How to install and run

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   This will:
   - Load environment variables from `.env`.  
   - Connect to the database.  
   - Run `sequelize.sync({ alter: true })` to create or update tables based on the models.  
   - Seed default roles (`student`, `teacher`).  
   - Start the Express server (default on `http://localhost:3000`).

3. **Verify the API is running**

   - Health check:

     ```bash
     curl http://localhost:3000/
     ```

   - Auth test route:

     ```bash
     curl http://localhost:3000/auth/
     ```

---

### Database migration (schema) workflow

This project uses **Sequelize models with automatic sync** instead of manual migration files:

- On every start, `server.js` calls:

  ```js
  sequelize.sync({ alter: true });
  ```

- This will:
  - Create tables if they do not exist.  
  - Add or modify columns to match your model definitions where possible.

**Recommended workflow when you change models:**

1. Update or add Sequelize model files in `src/models/`.  
2. Restart the server (`npm run dev`).  
3. Sequelize will automatically synchronize the schema with the new model definitions.

> If you prefer explicit migration files, you can later introduce `sequelize-cli` migrations and wire them to the existing `\"db:migrate\"` npm script. For the current version, schema changes are managed via `sequelize.sync`.

---

### Seeder / initial data

At startup, the service ensures that the basic roles needed by the attendance domain are present:

- **`student`**
- **`teacher`**

This happens in `server.js` after a successful `sequelize.sync`:

- If the roles do not exist, they are created.  
- If they already exist, they are left unchanged.

Because of this, **no manual seeder command is required** for roles:

1. Start the server with `npm run dev`.  
2. The database schema is synchronized.  
3. Default roles are created automatically if missing.

For additional seed data (e.g. demo users, courses, or test fingerprints), you can either:

- Create a dedicated script (e.g. `scripts/seed-demo-data.js`) and run it with `node scripts/seed-demo-data.js`, or  
- Add extra seeding logic next to the existing role seeding in `server.js`, guarded carefully to avoid duplicating records.

---

### Summary

- **Run the service:** `npm run dev`  
- **Schema migration:** handled automatically via `sequelize.sync({ alter: true })` on startup.  
- **Seeder:** default roles (`student`, `teacher`) are created automatically on startup; no additional command is required.
 