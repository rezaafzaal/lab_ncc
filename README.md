tes webhook

# 🚀 NCC — CI/CD Pipeline dengan Jenkins & SonarQube

[![Build Status](https://problem-citation-renewably.ngrok-free.dev/buildStatus/icon?job=ncc)](https://problem-citation-renewably.ngrok-free.dev/job/ncc)
[![Quality Gate Status](http://localhost:9000/api/project_badges/measure?project=ncc&metric=alert_status)](http://localhost:9000/dashboard?id=ncc)
[![Coverage](http://localhost:9000/api/project_badges/measure?project=ncc&metric=coverage)](http://localhost:9000/dashboard?id=ncc)

---

## 📋 Deskripsi

Project ini merupakan implementasi **CI/CD Pipeline** menggunakan **Jenkins** dan **SonarQube** yang berjalan di lingkungan Docker lokal. Pipeline dirancang untuk mengotomatiskan proses build, testing, analisis kualitas kode, hingga quality gate enforcement secara penuh.

---

## 🛠️ Tech Stack

| Tool                      | Fungsi                                     |
| ------------------------- | ------------------------------------------ |
| **Jenkins** (Blue Ocean)  | Automation server & pipeline orchestration |
| **SonarQube** (Community) | Analisis kualitas & keamanan kode          |
| **Docker**                | Containerization Jenkins & SonarQube       |
| **Node.js 18**            | Runtime aplikasi                           |
| **Express.js**            | Web framework                              |
| **Jest**                  | Unit testing & code coverage               |
| **ESLint**                | Static code linting                        |
| **ngrok**                 | Expose Jenkins untuk GitHub webhook        |

---

## 📁 Struktur Project

```
ncc/
├── src/
│   ├── app.js                  # Express app & routes
│   └── math.js                 # Utility functions
├── test/
│   ├── app.test.js             # Route integration tests
│   └── math.test.js            # Unit tests
├── Jenkinsfile                 # CI/CD Pipeline definition
├── sonar-project.properties    # SonarQube configuration
├── package.json
├── .eslintrc.json
└── .gitignore
```

---

## ⚙️ Alur Pipeline

```
Git Push
   ↓
GitHub Webhook → Jenkins
   ↓
┌─────────────────────────────────────┐
│  Stage 1: Checkout                  │
│  Stage 2: Build (npm install)       │
│  Stage 3: Quality Checks (PARALLEL) │
│     ├── Lint (ESLint)               │
│     └── Test (Jest + Coverage)      │
│  Stage 4: SonarQube Analysis        │
│  Stage 5: Quality Gate              │
│     ├── PASSED → ✅ SUCCESS         │
│     └── FAILED → ❌ ABORT           │
│  Post:    Cleanup Workspace         │
└─────────────────────────────────────┘
```

---

## ✅ Fitur yang Diimplementasikan

- [x] Jenkins Pipeline (Declarative Jenkinsfile)
- [x] Stage terstruktur: build → test → analyze
- [x] SonarQube Quality Gate — pipeline **FAIL** jika kualitas tidak lolos
- [x] Webhook — auto trigger pada setiap `git push`
- [x] Environment variables & credentials management
- [x] Build status badge
- [x] Optimasi pipeline — **parallel stage** (Lint + Test)

---

## 📊 Hasil SonarQube

| Metrik          | Hasil         |
| --------------- | ------------- |
| Quality Gate    | ✅ **Passed** |
| Coverage        | 91.3%         |
| Test Suites     | 2 passed      |
| Total Tests     | 12 passed     |
| Bugs            | 0             |
| Vulnerabilities | 0             |

---

## 🔧 Cara Menjalankan Lokal

### Prasyarat

- Docker & Docker Compose
- Node.js 18+
- ngrok (untuk webhook)

### Install dependencies

```bash
npm install
```

### Jalankan tests

```bash
npm test
```

### Jalankan lint

```bash
npm run lint
```

### Jalankan aplikasi

```bash
npm start
# Server berjalan di http://localhost:3000
```

---

## 🔗 Endpoint Aplikasi

| Method | Endpoint       | Deskripsi             |
| ------ | -------------- | --------------------- |
| GET    | `/`            | Hello message         |
| GET    | `/health`      | Health check          |
| GET    | `/add?a=3&b=7` | Penjumlahan dua angka |

---

## 📝 Konfigurasi Jenkins

1. **Plugin yang diperlukan:** SonarQube Scanner, Pipeline, Git, HTML Publisher, Embeddable Build Status, Workspace Cleanup
2. **Credentials:** Token SonarQube disimpan sebagai `Secret Text` dengan ID `sonarqube-token`
3. **SonarQube Server:** Nama server harus `SonarQube` (sesuai `withSonarQubeEnv('SonarQube')`)
4. **Webhook SonarQube → Jenkins:** `http://[IP_Jenkins]:8080/sonarqube-webhook/`

---

## 👤 Author

**Reza Afzaal Faizullah Taqy**
