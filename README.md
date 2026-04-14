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

## Screenshot / Bukti Endpoint

Endpoint dapat diakses secara publik melalui:

```bash
http://172.188.96.166:3000/health
```

![alt text](image.png)

Sudah bisa diakses dsecara publik

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
## Penjelasan Proses Deployment ke VPS

Deployment dilakukan menggunakan Virtual Machine berbasis Linux (Ubuntu) di cloud.

### Langkah-langkah:

### 1. Membuat VPS

Membuat Virtual Machine menggunakan platform cloud (Microsoft Azure) dengan sistem operasi Ubuntu.

### 2. Mengakses VPS menggunakan SSH

### 3. Menyalin Project dari Local ke VPS

Project yang sudah dibuat di local (WSL/laptop) dikirim ke VPS menggunakan perintah `scp`:

### 4. Menjalankan Aplikasi di VPS

```bash
cd tugas1_ncc
docker compose up -d --build
```


### 5. Membuka Port 3000

Port 3000 dibuka melalui pengaturan firewall.


### 6. Akses Endpoint Publik

Setelah semua langkah selesai, endpoint dapat diakses melalui browser:

```bash
http://172.188.96.166:3000/health
```

## Kendala yang Dihadapi

Mencari VPS yang gratis karena kemarin lbe ncc sudah pake azure

