# 📚 Sprint 8 | Inprocode

## 🎯 Main Goals

-   Practice Bootstrap 5/tailwind with React.
-   Work with the most popular plugins.
-   Creating an API in Node.js (used Java for this project).
-   Creating a CRUD.
-   Creating a map.
-   Creating a calendar.
-   Creating a graph.

## 📍 Project Status

✅ The project currently allows to log as admin into the dashboard. The dashboard includes functionalities to create, read, update, and delete users and stores, manage and edit data for both entities. Store locations are displayed on an interactive map using Mapbox GL JS. There is included a tab to visualize statistics about the stores and users in the system through charts and graphs. User schedules can be managed using a calendar interface, the current implementation only prints the selected shift in console until backend requirements are developed to store them in database.

🛂 A default admin user is created when the backend runs for the first time if there is no admin in the database. Login is required to access the admin panel.


## 🛠️ Getting Started

### 1️⃣ Clone this repository

```bash
git clone https://github.com/DiegoAPaez/8-Inprocode.git
cd 8-Inprocode
```

### 2️⃣ Install Dependencies

Make sure you have Node.js installed for the frontend and Maven for the backend. Then install the packages:

```bash
cd frontend
npm install
```

### 3️⃣ Install environment variables

To run project locally environment variables **must** be configured.

-   VITE_API_BASE_URL -> Backend URL for API Requests
-   VITE_MAPBOX_TOKEN -> MapBox Token

### 4️⃣ Start the Development Server

```bash
npm run dev
```

### 5️⃣ Setup backend application.properties

**Database**
-   spring.datasource.url
-   spring.datasource.driver-class-name
-   spring.datasource.username
-   spring.datasource.password
-   spring.jpa.properties.hibernate.dialect

**JPA/Hibernate**
-   spring.jpa.hibernate.ddl-auto
-   spring.jpa.show-sql

**SERVER / CORS**
-   server.port
-   spring.web.cors.allowed-origins
-   spring.web.cors.allowed-methods
-   spring.web.cors.allowed-headers
-   spring.web.cors.allow-credentials

**JWT SETTINGS**
-   application.security.jwt.secret-key
-   application.security.jwt.expiration

**DEF USER CREDENTIALS**
-   DEF_USER
-   DEF_PASS

**COOKIE SETTINGS**
-   app.cookie.secure
-   app.cookie.samesite


### 6️⃣ Launch server!

```bash
mvn spring-boot:run
```

## 📁 Folder Structure

### Frontend (React + TypeScript + Vite)
```
📂 frontend/
 ┣ 📂 src/
 ┃ ┣ 📂 components/           # React components (HomePage, WelcomePage, admin, etc.)
 ┃ ┣ 📂 contexts/             # React context providers (AuthContext, etc.)
 ┃ ┣ 📂 services/             # API service modules (api.ts, etc.)
 ┃ ┣ 📂 test/                 # Test setup and utilities
 ┃ ┃ ┣ 📂 components/         # Component tests
 ┃ ┃ ┣ 📂 contexts/           # Context tests
 ┃ ┃ ┗ 📄 setup.ts            # Test environment setup
 ┃ ┣ 📂 types/                # TypeScript type definitions (auth.ts, store.ts, etc.)
 ┃ ┣ 📂 utils/                # Utility functions (auth.ts, etc.)
 ┃ ┣ 📄 App.tsx               # Root React component
 ┃ ┣ 📄 index.css             # Global styles
 ┃ ┗ 📄 main.tsx              # Application entry point
 ┣ 📄 index.html              # HTML template
 ┣ 📄 package.json            # Project dependencies and scripts
 ┣ 📄 vite.config.ts          # Vite configuration
 ┗ 📄 vitest.config.ts        # Vitest configuration
```

### Backend (Spring Boot + Java + Maven)
```
📂 backend/
 ┣ 📂 src/
 ┃ ┣ 📂 main/
 ┃ ┃ ┣ 📂 java/com/spring/restaurantmanagementsystem/
 ┃ ┃ ┃ ┣ 📂 config/          # Configuration classes (SecurityConfig, DataInitializer)
 ┃ ┃ ┃ ┣ � controller/      # REST controllers (AuthController, AdminController, StoreController)
 ┃ ┃ ┃ ┣ 📂 dto/             # Data Transfer Objects (LoginRequest, UserDto, StoreDto, etc.)
 ┃ ┃ ┃ ┣ 📂 exception/       # Custom exceptions (ResourceNotFoundException)
 ┃ ┃ ┃ ┣ 📂 model/           # JPA entities (User, Store, Role, RoleEnum)
 ┃ ┃ ┃ ┣ 📂 repository/      # Data repositories (UserRepository, StoreRepository, RoleRepository)
 ┃ ┃ ┃ ┣ 📂 security/        # Security components (JwtService, JwtAuthenticationFilter, UserDetailsServiceImpl)
 ┃ ┃ ┃ ┣ 📂 service/         # Business logic services (AdminService, UserService, StoreService)
 ┃ ┃ ┃ ┗ �📄 BackendApplication.java  # Spring Boot main class
 ┃ ┃ ┗ 📂 resources/
 ┃ ┃   ┣ 📄 application.properties   # Application configuration
 ┃ ┃   ┣ 📂 static/          # Static web assets
 ┃ ┃   ┗ 📂 templates/       # Template files
 ┃ ┗ 📂 test/
 ┃   ┗ 📂 java/com/spring/restaurantmanagementsystem/
 ┃     ┣ 📂 controller/      # Controller tests (AdminControllerTest, AuthControllerTest)
 ┃     ┣ 📂 service/         # Service tests (AdminServiceTest)
 ┃     ┗ 📄 BackendApplicationTests.java  # Integration tests
 ┣ 📄 pom.xml                # Maven dependencies and build configuration
 ┣ 📄 mvnw                   # Maven wrapper script (Unix)
 ┗ 📄 mvnw.cmd               # Maven wrapper script (Windows)
```

## 💻 Technologies Used

![HTML Icon](https://skillicons.dev/icons?i=html "HTML Icon")
![CSS Icon](https://skillicons.dev/icons?i=css "CSS Icon")
![Tailwind Icon](https://skillicons.dev/icons?i=tailwind "Tailwind Icon")
![Typescript Icon](https://skillicons.dev/icons?i=typescript "Typescript Icon")
![React Icon](https://skillicons.dev/icons?i=react "React Icon")
![Vite Icon](https://skillicons.dev/icons?i=vite "Vite Icon")
![Node Icon](https://skillicons.dev/icons?i=nodejs "Node Icon")
![PostgreSQL](https://skillicons.dev/icons?i=postgresql "PostgreSQL Icon")
![Java](https://skillicons.dev/icons?i=java "Java Icon")
![Spring](https://skillicons.dev/icons?i=spring "Spring Icon")
![Maven](https://skillicons.dev/icons?i=maven "Maven Icon")

## 🤝 Contributions

Contributions are welcome. Please open an issue or a pull request to submit changes.

## ⏳ Project Status

![Static Badge](https://img.shields.io/badge/Completed-Completed?style=flat-square&label=Status) ![Static Badge](https://img.shields.io/badge/Pending-Revision?style=flat-square&label=Revision&color=yellow)
