Nama  : Reza Afzaal Faizullah Taqy <br>
NRP   : 5025241051
---
# Sistem Monitoring Server dengan Prometheus & Grafana di Microsoft Azure

<img width="1878" height="1122" alt="image" src="https://github.com/user-attachments/assets/deca7b96-37af-41c1-b819-00a4443e8365" />
<img width="766" height="251" alt="image" src="https://github.com/user-attachments/assets/28dc09bf-c6d2-428c-9d65-81ba278a191e" />


---

## Tech Stack

| Teknologi | Kegunaan |
|---|---|
| Prometheus | Mengumpulkan metrics monitoring dan time-series database |
| Grafana | Visualisasi metrics dan dashboard monitoring |
| Node Exporter | Mengekspos metrics sistem Linux (CPU, RAM, Disk, Network) |
| Alertmanager | Mengelola dan mengirim alert dari Prometheus |
| Gmail SMTP | Mengirim notifikasi alert melalui email |
| Microsoft Azure VM | VPS untuk deployment monitoring system |
| Azure Virtual Network | Komunikasi private antar VM |
| Azure NSG | Firewall dan pengaturan keamanan jaringan |
| stress | Melakukan stress test CPU dan memory |
| dd / fallocate | Simulasi penggunaan disk untuk testing alert |

---

## Deskripsi Proyek

Proyek ini merupakan implementasi sistem monitoring server secara penuh menggunakan stack **Prometheus**, **Grafana**, **Node Exporter**, dan **Alertmanager** yang di deploy pada dua Virtual Machine Microsoft Azure dengan sistem operasi **Ubuntu Server 24.04 LTS**.

Sistem monitoring yang dibangun mampu:
- Mengumpulkan metrics dari server secara real-time setiap 15 detik
- Menampilkan data monitoring dalam bentuk dashboard visual yang interaktif
- Mengevaluasi kondisi server berdasarkan alert rules yang telah dikonfigurasi
- Mengirimkan notifikasi email secara otomatis ketika terjadi anomali (CPU tinggi, memory penuh, disk hampir penuh, instance down, dll.)
- Menggunakan private network Azure untuk komunikasi antar VM demi keamanan yang lebih baik

---

## Infrastruktur Azure VM

### VM 1 — Prometheus Server

| Properti | Nilai |
|---|---|
| Nama VM | `prometheus-service` |
| Sistem Operasi | Ubuntu Server 24.04 LTS |
| Public IP | `20.2.233.227` |
| Private IP | `10.0.0.4` |
| Komponen yang Berjalan | Prometheus, Alertmanager, Node Exporter |
| Port yang Dibuka | 22 (SSH), 9090 (Prometheus), 9093 (Alertmanager), 9100 (Node Exporter) |

### VM 2 — Grafana Server

| Properti | Nilai |
|---|---|
| Nama VM | `grafana-server` |
| Sistem Operasi | Ubuntu Server 24.04 LTS |
| Public IP | `20.2.140.186` |
| Private IP | `10.0.0.5` |
| Komponen yang Berjalan | Grafana, Node Exporter |
| Port yang Dibuka | 22 (SSH), 3000 (Grafana), 9100 (Node Exporter) |

---

## Arsitektur Sistem Monitoring

### Diagram Arsitektur

```text
┌─────────────────────────┐              ┌─────────────────────────┐
│ VM 1 - prometheus       │              │ VM 2 - grafana          │
│ Private IP: 10.0.0.4    │              │ Private IP: 10.0.0.5    │
│ Public IP: 20.2.233.227 │              │ Public IP: 20.2.140.186 │
├─────────────────────────┤              ├──────────────────────┤
│ Prometheus :9090        │◄─────────────│ Grafana :3000        │
│ Alertmanager :9093      │  query       │                      │
│ Node Exporter :9100     │              │ Node Exporter :9100  │
└──────────┬──────────────┘              └──────────┬───────────┘
           │ scrape metrics                         │
           └────────────────────────────────────────┘

                    Private Network
```

---


## Konfigurasi Prometheus

File Konfigurasi Lengkap (`/etc/prometheus/prometheus.yml`)

```yaml
# ==============================
# KONFIGURASI PROMETHEUS UTAMA
# ==============================

global:
  scrape_interval: 15s          # Ambil metrics setiap 15 detik
  evaluation_interval: 15s      # Evaluasi alert rules setiap 15 detik
  scrape_timeout: 10s           # Timeout jika target tidak respond

# Konfigurasi Alertmanager
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - 'localhost:9093'  

# File alert rules
rule_files:
  - '/etc/prometheus/rules/*.yml'

# ==============================
# SCRAPE CONFIGS (TARGET)
# ==============================
scrape_configs:

  # Prometheus memonitor dirinya sendiri
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          instance: 'prometheus-server'
          environment: 'production'

  # Node Exporter di VM 1 (server Prometheus itu sendiri)
  - job_name: 'node-vm1'
    static_configs:
      - targets: ['localhost:9100']
        labels:
          instance: 'vm1-prometheus'
          environment: 'production'

  # Node Exporter di VM 2 (Grafana server) — menggunakan PRIVATE IP
  - job_name: 'node-vm2'
    static_configs:
      - targets: ['10.0.0.5:9100']
        labels:
          instance: 'vm2-grafana'
          environment: 'production'
```

### Penjelasan Parameter Konfigurasi

| Parameter | Nilai | Penjelasan |
|---|---|---|
| `scrape_interval` | 15s | Prometheus mengambil metrics dari setiap target setiap 15 detik |
| `evaluation_interval` | 15s | Alert rules dievaluasi setiap 15 detik |
| `scrape_timeout` | 10s | Jika target tidak merespons dalam 10 detik, scrape dianggap gagal |
| `alertmanagers.targets` | `localhost:9093` | Alamat Alertmanager yang berjalan di VM yang sama |
| `rule_files` | `/etc/prometheus/rules/*.yml` | Lokasi file alert rules |
| `node-vm2` target | `10.0.0.5:9100` | **Private IP** VM 2, bukan public IP |

### Penggunaan Private IP untuk node-vm2

Konfigurasi target `node-vm2` menggunakan private IP `10.0.0.5:9100` (bukan public IP `20.2.140.186:9100`). Hal ini dilakukan karena:

1. **Keamanan** — Port 9100 tidak perlu diekspos ke internet publik
2. **Performa** — Komunikasi melalui jaringan internal Azure lebih cepat dan memiliki latensi lebih rendah
3. **Best Practice** — Komunikasi antar service dalam satu VNet sebaiknya selalu menggunakan private IP

---

## Konfigurasi Data Source Grafana

### Screenshot Data Source

<img width="1861" height="493" alt="image" src="https://github.com/user-attachments/assets/654a7246-f718-4bd9-97a9-e18ea2dd04bc" />

<img width="1566" height="98" alt="image" src="https://github.com/user-attachments/assets/0a4eaf2d-e939-4d88-a431-4dc29dbd6d04" />

---

## Custom Dashboard Grafana

### Screenshot Dashboard

<img width="1528" height="713" alt="image" src="https://github.com/user-attachments/assets/82096289-27cd-4498-a0a5-6f708a565f30" />


Dashboard dibuat secara **manual dari nol** tanpa menggunakan template bawaan Grafana. Setiap panel dikonfigurasi dengan query PromQL yang spesifik untuk masing-masing jenis metrics.

### Panel 1 — CPU Usage (%)

Menampilkan persentase penggunaan CPU untuk setiap instance (vm1-prometheus dan vm2-grafana) secara real-time.

```promql
(1 - avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100
```

**Penjelasan Query:**
- `node_cpu_seconds_total{mode="idle"}` — Total waktu CPU dalam kondisi idle
- `rate(...[5m])` — Laju perubahan per detik dalam 5 menit terakhir
- `avg by(instance)` — Rata-rata semua core CPU, dikelompokkan per instance
- `1 - (idle rate)` — Mengkonversi idle rate menjadi usage rate
- `* 100` — Mengkonversi ke persentase

**Konfigurasi Panel:**
- Visualization: Time series
- Unit: Percent (0-100)
- Thresholds: 80% (orange), 95% (red)

---

### Panel 2 — Memory Usage (%)

Menampilkan persentase penggunaan memori RAM untuk setiap instance.

```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

**Penjelasan Query:**
- `node_memory_MemAvailable_bytes` — Jumlah memori yang tersedia (termasuk cache yang bisa dibebaskan)
- `node_memory_MemTotal_bytes` — Total kapasitas memori fisik
- Formula menghitung persentase memori yang sedang digunakan

**Konfigurasi Panel:**
- Visualization: Time series
- Unit: Percent (0-100)
- Thresholds: 80% (orange), 85% (red)

---

### Panel 3 — Disk Usage (%)

Menampilkan persentase penggunaan disk pada filesystem root (`/`).

```promql
(1 - node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"}) * 100
```

**Penjelasan Query:**
- `mountpoint="/"` — Filter hanya filesystem root
- `fstype!="rootfs"` — Exclude virtual filesystem
- Menghitung persentase ruang disk yang terpakai

**Konfigurasi Panel:**
- Visualization: Time series
- Unit: Percent (0-100)

---

### Panel 4 — Network Traffic (bytes/s)

Menampilkan laju transfer data jaringan yang diterima oleh setiap network interface.

```promql
rate(node_network_receive_bytes_total{device!="lo"}[5m])
```

**Penjelasan Query:**
- `node_network_receive_bytes_total` — Total bytes yang diterima sejak server start
- `{device!="lo"}` — Exclude interface loopback
- `rate(...[5m])` — Mengkonversi counter menjadi laju bytes per detik

**Konfigurasi Panel:**
- Visualization: Time series
- Unit: bytes/sec

---

### Panel 5 — CPU Load Average

Menampilkan load average CPU dalam window 1 menit, memberikan gambaran beban kerja sistem secara keseluruhan.

```promql
node_load1
```

**Penjelasan Query:**
- `node_load1` — Load average 1 menit (jumlah proses yang sedang berjalan atau menunggu CPU)
- Nilai normal: di bawah jumlah CPU core yang tersedia

**Konfigurasi Panel:**
- Visualization: Time series
- Unit: short

---

### Panel 6 — Disk I/O Rate (%)

Menampilkan persentase waktu disk sedang melakukan operasi I/O (input/output).

```promql
rate(node_disk_io_time_seconds_total[5m]) * 100
```

**Penjelasan Query:**
- `node_disk_io_time_seconds_total` — Total waktu dalam detik disk melakukan I/O
- `rate(...[5m])` — Laju per detik dalam 5 menit terakhir
- `* 100` — Mengkonversi ke persentase (nilai 1.0 = 100% disk utilization)

**Konfigurasi Panel:**
- Visualization: Time series
- Unit: Percent (0-100)

---

### Ringkasan Query PromQL per Panel

| Panel | Fungsi PromQL | Tipe Metrics |
|---|---|---|
| CPU Usage | `rate()`, `avg by()` | Gauge (derived) |
| Memory Usage | Aritmatika ratio | Gauge |
| Disk Usage | Aritmatika ratio | Gauge |
| Network Traffic | `rate()` | Counter → Rate |
| CPU Load | Direct metric | Gauge |
| Disk I/O Rate | `rate()` | Counter → Rate |

---

## Alur Monitoring

### Diagram Alur Lengkap

```
┌─────────────────┐     scrape      ┌──────────────────┐
│  NODE EXPORTER  │ ──────────────► │    PROMETHEUS    │
│  VM1: :9100     │   setiap 15s    │    VM1: :9090    │
│  VM2: :9100     │                 │                  │
└─────────────────┘                 │  - Simpan TSDB   │
                                    │  - Eval rules    │
                                    └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────────┐
                    │                        │                    │
                    ▼ query PromQL           │ alert fired        ▼
           ┌────────────────┐               │           ┌──────────────────┐
           │    GRAFANA     │               │           │  ALERTMANAGER    │
           │  VM2: :3000    │               │           │  VM1: :9093      │
           │                │               │           │                  │
           │  - Dashboard   │               │           │  - Deduplicate   │
           │  - Visualisasi │               │           │  - Group alerts  │
           │  - Real-time   │               │           │  - Route         │
           └────────────────┘               │           └────────┬─────────┘
                                            │                    │
                                            │                    ▼ SMTP
                                            │           ┌──────────────────┐
                                            │           │   GMAIL SMTP     │
                                            │           │  smtp.gmail.com  │
                                            └──────────►│  Port: 587       │
                                                        │                  │
                                                        └────────┬─────────┘
                                                                 │
                                                                 ▼
                                                         Email Notification
                                                        
```


## Konfigurasi Alertmanager

### File Konfigurasi (`/etc/alertmanager/alertmanager.yml`)

```yaml
global:
  smtp_from: 'rezaafzaaltq@gmail.com'
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_auth_username: 'rezaafzaaltq@gmail.com'
  smtp_auth_password: 'zfdt ydha ljqk xxxx'    
  smtp_require_tls: true

route:
  group_by: ['alertname', 'instance']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 3h
  receiver: 'email-alert'

receivers:
  - name: 'email-alert'
    email_configs:
      - to: 'cangkecangkecang@gmail.com'
        send_resolved: true
        headers:
          Subject: '[{{ .Status | toUpper }}] {{ .CommonLabels.alertname }}'
```

### Penjelasan Parameter

| Parameter | Nilai | Penjelasan |
|---|---|---|
| `smtp_smarthost` | `smtp.gmail.com:587` | Server dan port SMTP Gmail dengan STARTTLS |
| `smtp_auth_username` | Email pengirim | Akun Gmail yang digunakan untuk mengirim alert |
| `smtp_auth_password` | App Password | **Gmail App Password** |
| `smtp_require_tls` | `true` | Wajib menggunakan TLS/STARTTLS untuk enkripsi |
| `group_by` | `alertname`, `instance` | Alert dikelompokkan berdasarkan nama dan instance |
| `group_wait` | `30s` | Tunggu 30 detik sebelum kirim notifikasi pertama |
| `group_interval` | `5m` | Interval pengiriman notifikasi untuk alert baru dalam grup |
| `repeat_interval` | `3h` | Kirim ulang notifikasi setiap 3 jam jika alert masih aktif |
| `send_resolved` | `true` | Kirim notifikasi saat alert kembali normal (resolved) |

### Gmail App Password

Gmail App Password adalah password 16 karakter yang dibuat khusus untuk aplikasi pihak ketiga yang tidak mendukung OAuth. App Password dibuat melalui **Google Account → Security → 2-Step Verification → App Passwords**, maka dari itu disini saya tidak menulis password dengan lengkap


### Alert Rules (`/etc/prometheus/rules/server_alerts.yml`)

```yaml
groups:
  - name: server_health
    interval: 15s
    rules:

      - alert: HighCPUUsage
        expr: (1 - avg by(instance) (rate(node_cpu_seconds_total{mode='idle'}[5m]))) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'CPU tinggi di {{ $labels.instance }}'
          description: 'CPU usage {{ $value | humanizePercentage }}'

      - alert: CriticalCPUUsage
        expr: (1 - avg by(instance) (rate(node_cpu_seconds_total{mode='idle'}[5m]))) * 100 > 95
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: 'CPU KRITIS di {{ $labels.instance }}'
          description: 'CPU usage {{ $value | humanizePercentage }}'

      - alert: HighMemoryUsage
        expr: (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 85
        for: 10s
        labels:
          severity: warning
        annotations:
          summary: 'Memory tinggi di {{ $labels.instance }}'
          description: 'Memory usage {{ $value | humanizePercentage }}'

      - alert: HighDiskUsage
        expr: (1 - node_filesystem_avail_bytes{fstype!='tmpfs'} / node_filesystem_size_bytes{fstype!='tmpfs'}) * 100 > 15
        for: 10s
        labels:
          severity: warning
        annotations:
          summary: 'Disk hampir penuh di {{ $labels.instance }}'
          description: 'Disk {{ $labels.mountpoint }}: {{ $value | humanizePercentage }}'

      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'Instance {{ $labels.instance }} down!'
          description: 'Job {{ $labels.job }} instance {{ $labels.instance }} tidak respond'

      - alert: DiskWillFillIn24h
        expr: predict_linear(node_filesystem_avail_bytes[6h], 24 * 3600) < 0
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: 'Disk {{ $labels.mountpoint }} akan penuh dalam 24 jam'
          description: 'Berdasarkan trend penggunaan saat ini'
```

---

## Implementasi Private Networking Azure

### Penggunaan Private IP Antar VM

Seluruh komunikasi antar komponen monitoring dalam proyek ini dikonfigurasi menggunakan **private IP** Azure Virtual Network, bukan public IP. Berikut adalah ringkasan penggunaan private IP:

| Komunikasi | Dari | Ke | Private IP yang Digunakan |
|---|---|---|---|
| Prometheus → Node Exporter VM2 | VM1 (10.0.0.4) | VM2 (10.0.0.5) | `10.0.0.5:9100` |
| Grafana → Prometheus API | VM2 (10.0.0.5) | VM1 (10.0.0.4) | `10.0.0.4:9090` |
| Prometheus → Alertmanager | VM1 (10.0.0.4) | VM1 (10.0.0.4) | `localhost:9093` |


### Konfigurasi NSG (Network Security Group) Azure

Azure NSG dikonfigurasi untuk setiap VM sebagai berikut:

**NSG VM 1 (prometheus-service) — Inbound Rules:**

| Port | Protocol | Source | Keterangan |
|---|---|---|---|
| 22 | TCP | Any | SSH akses administrator |
| 9090 | TCP | VirtualNetwork | Prometheus UI (hanya dari VNet) |
| 9093 | TCP | VirtualNetwork | Alertmanager (hanya dari VNet) |
| 9100 | TCP | VirtualNetwork | Node Exporter (hanya dari VNet) |

**NSG VM 2 (grafana-server) — Inbound Rules:**

| Port | Protocol | Source | Keterangan |
|---|---|---|---|
| 22 | TCP | Any | SSH akses administrator |
| 3000 | TCP | Any | Grafana UI (akses publik untuk dashboard) |
| 9100 | TCP | VirtualNetwork | Node Exporter (hanya dari VNet) |

### Pembatasan Akses Port 9100

Port 9100 (Node Exporter) dikonfigurasi agar hanya dapat diakses oleh sumber yang berada dalam Azure Virtual Network menggunakan **Service Tag `VirtualNetwork`**. Hal ini memastikan bahwa:

- Prometheus (di VM 1) dapat mengakses Node Exporter VM 2 melalui private IP `10.0.0.5:9100` 
- Internet publik **tidak dapat** mengakses endpoint metrics Node Exporter 
- Data sensitif mengenai kondisi server terlindungi dari akses tidak sah 

---

## Kendala dan Solusi
### 1. Komunikasi Antar VM Awalnya Menggunakan Public IP

#### Kendala
Pada awal saat saya melakukan konfigurasi pada prometheus saya menggunaka public ip dari grafana dimana disini saya tidak notice bahwa diminta untuk menggunakan private ip.

Perubahan yang dilakukan:
- Mengubah target scrape Prometheus dari public IP ke private IP
- Menyesuaikan konfigurasi `prometheus.yml`
- Mengatur Azure NSG agar port monitoring hanya dapat diakses dari internal virtual network
- Melakukan restart service Prometheus dan Grafana setelah konfigurasi diperbarui

Hasil akhirnya:
- Komunikasi monitoring berjalan menggunakan private network
- Node Exporter berhasil diakses melalui private IP
- Monitoring menjadi lebih aman dan stabil

---

### 2. Stress Test Tidak Stabil Saat Trigger Alert

#### Kendala
Saat saya melakukan testing alert CPU dan memory menggunakan tools `stress`, penggunaan resource tidak tahan lama sehingga tidak memicu adanya email alert(pending).

Akibatnya:
- Status alert hanya berada pada kondisi `PENDING`
- Email alert tidak terkirim karena belum mencapai status `FIRING`



##### Sollusi
Menggunakan parameter stress test yang lebih stabil:

```bash
stress --vm 2 --vm-bytes 3000M --vm-keep --timeout 600 &
```
---

## 🧪 Stress Test & Pengujian Alerting
Pengujian dilakukan untuk memastikan alert Prometheus berjalan dengan baik dan notifikasi email berhasil terkirim melalui Alertmanager.
---

### 1. CPU Usage — `HighCPUUsage`

Menampilkan persentase penggunaan CPU di kedua server menggunakan visualisasi Gauge.

```promql
100 * (1 - avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])))
```

Melakukan stress test:

```bash
stress --cpu 8 --timeout 600 &
```
<img width="823" height="279" alt="image" src="https://github.com/user-attachments/assets/1a0a4703-92e0-4d03-a913-d80d3f8a8156" />


- CPU usage naik di atas 80%
- Alert berubah dari PENDING menjadi FIRING
- Email notifikasi berhasil diterima

#### alert high cpu usage (>80%)
<img width="1564" height="772" alt="image" src="https://github.com/user-attachments/assets/7674dc14-4826-440c-8608-3985f1db5bcf" />


#### alert critical cpu usage (>95%)
<img width="1564" height="707" alt="image" src="https://github.com/user-attachments/assets/db031792-bc7a-45fa-93f6-f38c105d4666" />


---

### 2. Memory Usage — `HighMemoryUsage`

Menampilkan persentase penggunaan RAM di kedua server menggunakan visualisasi Gauge.

```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

Melakukan stress test:

```bash
stress --vm 2 --vm-bytes 3200M --vm-keep --timeout 600 &
```
<img width="786" height="296" alt="image" src="https://github.com/user-attachments/assets/23a7f34c-42ec-4aaf-aa92-95504ea64e70" />

- Memory usage naik di atas 85%
- Alert berubah dari PENDING menjadi FIRING
- Email notifikasi berhasil diterima

#### alert high memory usage
<img width="1564" height="950" alt="image" src="https://github.com/user-attachments/assets/19df813e-1490-4342-9895-4ff50710d463" />


---

### 3. Disk Usage — `HighDiskUsage`

Menampilkan persentase penggunaan disk di kedua server menggunakan visualisasi Gauge.

```promql
(1 - node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"}) * 100
```

Melakukan stress test:

```bash
dd if=/dev/zero of=/tmp/bigfile bs=1M count=5000
```
<img width="784" height="276" alt="image" src="https://github.com/user-attachments/assets/38bed2f8-d72b-4794-83c2-2b21008813e8" />

Setelah pengujian selesai, hapus file dummy:

```bash
rm /tmp/bigfile
```

- Disk usage naik di atas 85%
- Alert berubah dari PENDING menjadi FIRING
- Email notifikasi berhasil diterima

#### alert high disk usage
<img width="1561" height="836" alt="image" src="https://github.com/user-attachments/assets/59c9fe14-b695-4b98-bb3b-3e4766a44778" />


---
