Nama  : Reza Afzaal Faizullah Taqy <br>
NRP   : 5025241051
---
## Deskripsi Singkat Service

Membuat service aplikasi backend sederhana menggunakan **Node.js** yang berfungsi untuk menyediakan endpoint `/health`. Endpoint ini digunakan untuk mengecek apakah service berjalan dengan baik atau tidak.

Aplikasi ini dijalankan menggunakan **Docker container** dan dideploy ke **Virtual Machine (VPS)** sehingga dapat diakses secara publik melalui internet.

---

## Penjelasan Endpoint `/health`

Endpoint `/health` digunakan sebagai **health check** untuk memastikan bahwa service berjalan dengan normal.

### Detail Endpoint:

- Method: `GET`
- URL: `/health`

### Penjelasan:

- `status`: Menunjukkan status service
- `uptime`: Lama service berjalan
- `timestamp`: Waktu saat request dilakukan

Endpoint ini akan mengembalikan status **HTTP 200 OK** jika service berjalan dengan baik.

---

## Penjelasan Proses Build dan Run Docker

Command:

```bash
docker compose up -d --build
```

Diakses melalui:

```bash
http://172.188.96.166:3000/health
```

- Docker membaca konfigurasi docker-compose.yml
- Melakukan build image Dockerfile (multi-stage build)
- Menjalankan container
- Menghubungkan port 3000 dari container ke host
- Mengaktifkan restart policy (unless-stopped)

---

## Containerization
```dockerfile
# builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# runner 

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY src/ ./src/
COPY package.json ./

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

USER node

CMD ["node", "src/index.js"]

```
### Penjelasan
- Multi-stage build

Memisahkan stage builder dan runner agar image lebih kecil dan bersih.
- Base image node:20-alpine

Menggunakan image ringan dan stabil untuk production.
- Install dependency production
```bash
npm ci --only=production
```
- Reuse node_modules dari builder

Menghindari install ulang di stage akhir → lebih cepat & efisien.
- Copy source code (src/)

Menyalin file aplikasi ke dalam container.
- Environment variable, PORT=3000, NODE_ENV=production
Expose port
```dockerfile
EXPOSE 3000
```
- Healthcheck
Mengecek endpoint /health tiap 30 detik.
Jika gagal 3 kali → status container unhealthy.
- Security (USER node)
Menjalankan container tanpa root untuk keamanan.
- Run aplikasi
```bash
node src/index.js
```

---

## Penjelasan Proses Deployment ke VPS

Deployment dilakukan menggunakan Virtual Machine berbasis Linux (Ubuntu) menggunakan Azure.

### Langkah-langkah:

### 1. Membuat VPS

Membuat Virtual Machine menggunakan platform cloud (Microsoft Azure) dengan sistem operasi Ubuntu.

### 2. Mengakses VPS menggunakan SSH
```bash
ssh -i "C:\Users\ROG\Downloads\vm-ncc-key.pem" azureuser@172.188.96.166
```
### 3. Menyalin Project dari Local ke VPS

Project yang sudah dibuat di local dikirim ke VPS menggunakan perintah `scp`:
```bash
scp -i "C:\Users\ROG\Downloads\vm-ncc-key.pem" -r "C:\Users\ROG\tugas1_ncc" azureuser@172.188.96.166:~
```

### 4. Menjalankan Aplikasi di VPS

```bash
cd tugas1_ncc
docker compose up -d --build
```

<img width="1458" height="605" alt="image" src="https://github.com/user-attachments/assets/847a848c-7aeb-45df-99f6-b8c243536f2b" />



### 5. Membuka Port 3000

Port 3000 dibuka melalui pengaturan firewall.
<img width="983" height="56" alt="image" src="https://github.com/user-attachments/assets/46a214dd-09ed-4dde-a9cd-967c424deaed" />


### 6. Akses Endpoint Publik

Setelah semua langkah selesai, endpoint dapat diakses melalui browser:

```bash
http://172.188.96.166:3000/health
```
<img width="599" height="127" alt="image" src="https://github.com/user-attachments/assets/3c74399d-6140-4f06-bba7-1adbba2c880d" />


## Kendala yang Dihadapi

Mencari VPS yang gratis karena kemarin lbe ncc sudah pake azure

