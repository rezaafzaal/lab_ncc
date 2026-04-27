tes webhook lagi

# CI/CD Pipeline dengan Jenkins & SonarQube

[![Build Status](https://problem-citation-renewably.ngrok-free.dev/buildStatus/icon?job=ncc)](https://problem-citation-renewably.ngrok-free.dev/job/ncc)

---

## Deskripsi

Project ini merupakan implementasi **CI/CD Pipeline** menggunakan **Jenkins** dan **SonarQube** yang berjalan di lingkungan Docker lokal. Pipeline dirancang untuk mengotomatiskan proses build, testing, analisis kualitas kode, hingga quality gate enforcement secara penuh.

---

## Tech Stack

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

## Struktur Project

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

## Alur Pipeline

Pertama, Jenkins mengambil source code terbaru dari repository (checkout).
Setelah itu masuk ke tahap build, di mana dependency project di-install menggunakan npm.

Selanjutnya dilakukan pengecekan kualitas code. Di tahap ini ada dua proses yang berjalan bersamaan: linting untuk memastikan code sesuai standar, dan testing untuk memastikan program berjalan dengan benar serta menghasilkan coverage.

Kalau semua lolos, pipeline lanjut ke analisis menggunakan SonarQube untuk mengecek kualitas code secara lebih mendalam.
Hasil analisis ini kemudian dicek lewat Quality Gate. Jika standar kualitas terpenuhi, pipeline dinyatakan berhasil. Kalau tidak, pipeline akan dihentikan.

Di akhir proses, Jenkins membersihkan workspace agar tidak ada file sisa dari build sebelumnya.

---

## Fitur yang Diimplementasikan

- Jenkins Pipeline (Declarative Jenkinsfile)
- Stage terstruktur: build → test → analyze
- SonarQube Quality Gate — pipeline **FAIL** jika kualitas tidak lolos
- Webhook — auto trigger pada setiap `git push`
- Environment variables & credentials management
- Build status badge
- Optimasi pipeline — **parallel stage** (Lint + Test)

---

## Hasil SonarQube

<img width="1819" height="822" alt="image" src="https://github.com/user-attachments/assets/7cdcc963-f351-4ae5-b4df-99bb995b2f99" />


Hasil analisis SonarQube menunjukkan Quality Gate Passed dengan Security, Reliability, dan Maintainability grade A. Coverage mencapai 89.3% dari total 22 lines yang dianalisis.

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

1. **Plugin yang diperlukan:** SonarQube Scanner, Pipeline, Git, Embeddable Build Status, Workspace Cleanup
2. **Credentials:** Token SonarQube disimpan sebagai `Secret Text` dengan ID `sonarqube-token`
3. **SonarQube Server:** Nama server harus `SonarQube`
4. **Webhook SonarQube → Jenkins:** `http://172.20.0.2:8080/sonarqube-webhook/`

---

## 👤 Author

**Reza Afzaal Faizullah Taqy**
