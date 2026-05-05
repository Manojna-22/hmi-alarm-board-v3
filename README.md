# HMI Alarm Acknowledgement Board

Industry-grade full-stack project:
- **Backend**: Spring Boot 3 · Hibernate · MySQL · Maven 3.9.x
- **Frontend**: Angular 18 · Chart.js · TypeScript
- **Database**: MySQL (via MySQL Workbench)
- **IDE**: VS Code

---

## Prerequisites

| Tool           | Version Required | Check Command              |
|----------------|-----------------|----------------------------|
| JDK            | 21+ (use 21)    | `java -version`            |
| Maven          | 3.9.11          | `mvn -version`             |
| Node.js        | 18+             | `node -v`                  |
| npm            | 9+              | `npm -v`                   |
| Angular CLI    | 18              | `ng version`               |
| MySQL Workbench| 8.x             | (open app)                 |

> **IMPORTANT — JDK Note:** Spring Boot 3.3.x supports Java 21 officially.
> JDK 25 is a preview release. This project is configured for `java.version=21`
> in `pom.xml` for maximum compatibility. If you only have JDK 25 installed,
> change `<java.version>21</java.version>` to `<java.version>25</java.version>`
> in `backend/pom.xml` (both `<source>` and `<target>` in the compiler plugin too).

---

## Step 1 — MySQL Database Setup

1. Open **MySQL Workbench**
2. Connect to your local MySQL server (default: `root` / `root`)
3. Run this SQL (the app will auto-create the tables via Hibernate):

```sql
CREATE DATABASE IF NOT EXISTS hmi_alarm_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

4. If your MySQL password is different from `root`, update:
   `backend/src/main/resources/application.properties`

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

---

## Step 2 — Backend Setup (Spring Boot)

Open a terminal in VS Code and run:

```bash
# Navigate to backend
cd hmi-alarm-board/backend

# Verify Maven version
mvn -version
# Should show: Apache Maven 3.9.11

# Clean and install dependencies
mvn clean install -DskipTests

# Run the application
mvn spring-boot:run
```

The backend will start at: **http://localhost:8080**

### Verify it's running:
- Open browser → http://localhost:8080/api/alarms/summary
- Swagger UI → http://localhost:8080/api/swagger-ui.html

---

## Step 3 — Frontend Setup (Angular)

Open a **new terminal** in VS Code:

```bash
# Navigate to frontend
cd hmi-alarm-board/frontend

# Install Angular CLI globally (only once)
npm install -g @angular/cli@18

# Install project dependencies
npm install

# Start the development server
ng serve
```

The frontend will start at: **http://localhost:4200**

---

## Step 4 — Open in VS Code

```bash
# Open the whole project in VS Code
code hmi-alarm-board/
```

Install these VS Code extensions for best experience:
- **Extension Pack for Java** (Microsoft)
- **Spring Boot Extension Pack** (Pivotal)
- **Angular Language Service** (Angular)
- **Prettier - Code Formatter**

---

## Project Structure

```
hmi-alarm-board/
├── backend/                          # Spring Boot project
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/hmi/alarm/
│           │   ├── AlarmBoardApplication.java
│           │   ├── config/           # CORS, ModelMapper, OpenAPI
│           │   ├── controller/       # REST controllers
│           │   ├── dto/              # Request/Response DTOs
│           │   ├── entity/           # JPA entities
│           │   ├── exception/        # Custom exceptions + handler
│           │   ├── repository/       # Spring Data JPA repos
│           │   └── service/          # Business logic
│           └── resources/
│               └── application.properties
│
└── frontend/                         # Angular project
    ├── angular.json
    ├── package.json
    └── src/
        ├── app/
        │   ├── components/           # Reusable UI components
        │   │   ├── alarm-filter/
        │   │   ├── alarm-list/
        │   │   ├── ack-button/
        │   │   ├── donut-chart/
        │   │   ├── navbar/
        │   │   └── severity-legend/
        │   ├── models/               # TypeScript interfaces
        │   ├── pages/dashboard/      # Main dashboard page
        │   └── services/             # HTTP service layer
        └── assets/styles/
            └── global.scss
```

---

## API Endpoints Reference

| Method | URL                            | Description                     |
|--------|--------------------------------|---------------------------------|
| GET    | /api/alarms                    | Get all alarms (paginated)      |
| GET    | /api/alarms?severity=HIGH      | Filter by severity              |
| GET    | /api/alarms?state=ACTIVE       | Filter by state                 |
| GET    | /api/alarms?keyword=motor      | Search alarms                   |
| GET    | /api/alarms/{id}               | Get alarm by ID                 |
| POST   | /api/alarms                    | Create new alarm                |
| PUT    | /api/alarms/{id}               | Update alarm                    |
| DELETE | /api/alarms/{id}               | Delete alarm                    |
| PATCH  | /api/alarms/{id}/acknowledge   | Acknowledge alarm               |
| PATCH  | /api/alarms/{id}/clear         | Clear alarm                     |
| GET    | /api/alarms/{id}/events        | Get alarm event history         |
| GET    | /api/alarms/summary            | Dashboard summary stats         |

Full Swagger docs: http://localhost:8080/api/swagger-ui.html

---

## Pushing to GitHub

### First time (new repo):

```bash
# 1. Go to github.com → New Repository
#    Name: hmi-alarm-board
#    Make it Private or Public → Create (do NOT add README)

# 2. Open terminal in your project root
cd hmi-alarm-board

# 3. Initialize git
git init

# 4. Create a .gitignore (already included)

# 5. Add all files
git add .

# 6. First commit
git commit -m "feat: initial HMI Alarm Board - Spring Boot + Angular"

# 7. Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/hmi-alarm-board.git

# 8. Push
git branch -M main
git push -u origin main
```

### After making changes:
```bash
git add .
git commit -m "feat: describe what you changed"
git push
```

---

## Common Errors & Fixes

### Maven: `JAVA_HOME` not set
```bash
# Windows — set in System Environment Variables
JAVA_HOME = C:\Program Files\Java\jdk-21
# Then restart VS Code terminal
```

### Port 8080 already in use
```bash
# Windows — find and kill the process
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

### MySQL connection refused
- Make sure MySQL service is running
- Check MySQL Workbench can connect
- Verify username/password in `application.properties`

### Angular: `ng` not recognized
```bash
npm install -g @angular/cli@18
# Restart terminal
```

### CORS errors in browser
- Make sure backend is running on port 8080
- Check `WebConfig.java` has `http://localhost:4200` in allowed origins

---

## Features

- ✅ Full CRUD for alarms
- ✅ Severity levels: LOW / MEDIUM / HIGH / CRITICAL
- ✅ State machine: ACTIVE → ACKNOWLEDGED → CLEARED
- ✅ Audit trail (AlarmEvent log for every transition)
- ✅ Auto-generated random alarms every 10 seconds (scheduler)
- ✅ Dashboard with live stats, donut chart, severity legend
- ✅ Pagination, filtering by severity/state, keyword search
- ✅ Inline acknowledge form with operator name + note
- ✅ Toast notifications
- ✅ Auto-refresh every 10 seconds
- ✅ Swagger UI for API testing
- ✅ Unit + integration tests with H2 in-memory DB
