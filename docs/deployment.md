# Deployment — ParsPack VPS (Ubuntu LTS, Docker, Nginx)

Target server: **8 vCPU · 16 GB RAM · 150 GB NVMe · Ubuntu LTS** on ParsPack, with ParsPack CDN in front.
This guide covers the **current frontend-only** deployment and the path to the full stack.

> **Status.** The Dockerfile, Compose file, Nginx config and deploy/rollback scripts were built and exercised in a sandbox: image build, two healthy replicas, Nginx with a self-signed certificate (HTTP/2, redirects, gzip, image disk cache MISS→HIT, rate limiting, failover with one replica stopped), and a scripted rollback. **Nothing has been deployed to ParsPack yet**; DNS, real certificates and the CDN must be configured on the real infrastructure.

```
Users ──► ParsPack CDN + WAF ──► :443 Nginx (host) ──► 127.0.0.1:3001  kasra-web-1 (Docker)
                                                   └─► 127.0.0.1:3002  kasra-web-2 (Docker)
```

---

## 1. Prepare the server

```bash
# As root on a fresh Ubuntu LTS (24.04 recommended)
apt update && apt full-upgrade -y
apt install -y git curl ufw fail2ban unattended-upgrades nginx certbot python3-certbot-nginx
dpkg-reconfigure -plow unattended-upgrades          # automatic security updates
timedatectl set-timezone Asia/Tehran

adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh && cp ~/.ssh/authorized_keys /home/deploy/.ssh/ && chown -R deploy: /home/deploy/.ssh
```

SSH hardening (`/etc/ssh/sshd_config.d/10-kasra.conf`), then `systemctl reload ssh`:

```
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
```

A 2 GB swap file protects against short memory spikes during builds:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
sysctl -w vm.swappiness=10 && echo 'vm.swappiness=10' > /etc/sysctl.d/99-kasra.conf
```

## 2. Firewall

Only SSH, HTTP and HTTPS are exposed. The Next.js containers bind to `127.0.0.1`, so they are unreachable from outside even though Docker writes its own iptables rules.

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow from <ADMIN_IP>/32 to any port 22 proto tcp   # or `ufw limit 22/tcp` if admins have dynamic IPs
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

When the CDN is active, restrict 80/443 to the CDN's published egress ranges (plus your monitoring host) so the origin cannot be attacked directly. **Never publish PostgreSQL (5432) or Redis (6379)**: in the future Compose file they have no `ports:` at all.

## 3. Docker

```bash
curl -fsSL https://get.docker.com | sh       # or Docker's apt repository
usermod -aG docker deploy
systemctl enable --now docker               # containers come back after reboots (restart: unless-stopped)
```

`/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "20m", "max-file": "5" },
  "live-restore": true,
  "registry-mirrors": ["https://<registry-mirror-provided-by-your-host>"]
}
```

> **Registries from Iran.** Docker Hub and some package registries may block, filter or rate-limit traffic from Iranian IP ranges. Configure a Docker registry mirror that your provider documents, or build the image elsewhere (CI) and ship it (§8). The Dockerfile accepts `--build-arg NPM_REGISTRY=<mirror>` for npm, and `--secret id=npm_ca,src=<ca.pem>` if outbound TLS is inspected. The runtime image installs no OS packages and the app loads no third-party fonts or scripts at runtime.

## 4. Get the code and configure

```bash
sudo mkdir -p /opt/kasra && sudo chown deploy: /opt/kasra
git clone https://github.com/Iman-gholami/kasra-claude.git /opt/kasra
cd /opt/kasra
cp .env.example .env.production && chmod 600 .env.production
```

Edit `.env.production`:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>`, used for canonicals, sitemap and JSON-LD. Inlined at **build** time. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Keep `false` until the real launch. `true` enables indexing and the sitemap in `robots.txt`. |
| `KASRA_TAG` | Image tag; `deploy.sh` maintains it. |
| `NODE_OPTIONS` | Heap per container (default `--max-old-space-size=1024`, below the 1.5 GB limit). |

No secrets are required in this phase. Future secrets (database, payment, SMS keys) belong in root-only env files or a secret manager, never in Git, build arguments or images.

## 5. Build and start

```bash
cd /opt/kasra
set -a; . ./.env.production; set +a
KASRA_TAG=$(git rev-parse --short HEAD) docker compose build
KASRA_TAG=$(git rev-parse --short HEAD) docker compose up -d
docker compose ps                         # web-1 and web-2 → (healthy)
curl -s 127.0.0.1:3001/api/health && curl -s 127.0.0.1:3002/api/health
```

Container settings (see `docker-compose.yml`): non-root user, `init: true` for signal forwarding, 30 s graceful stop, `no-new-privileges`, all capabilities dropped, CPU/memory limits and reservations, Docker health checks, rotated JSON logs, and a named volume per replica for `.next/cache` (optimized images survive restarts).

## 6. Nginx

```bash
sudo cp deploy/nginx/kasra.conf /etc/nginx/sites-available/kasra.conf
sudo sed -i 's/kasra\.example/<your-domain>/g' /etc/nginx/sites-available/kasra.conf
sudo ln -s /etc/nginx/sites-available/kasra.conf /etc/nginx/sites-enabled/kasra.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/kasra-errors /var/www/certbot /var/cache/nginx/kasra_img
sudo cp deploy/nginx/50x.html /var/www/kasra-errors/
```

The config provides: HTTP→HTTPS and `www`→apex redirects; TLS 1.2/1.3; HTTP/2; an upstream with keep-alive, `least_conn` and passive failover between the two replicas; gzip; immutable caching for `/_next/static`; a 5 GB disk cache for `/_next/image` keyed by URL and negotiated format (AVIF/WebP); per-IP rate limits (pages 30 r/s, API 10 r/s with bursts); `proxy_buffering off` for pages so Partial Prerendering can stream; blocked dotfiles; a branded 50x page; and access logs with upstream timing and cache status.

If the server has IPv6 disabled, remove the `listen [::]` lines.

## 7. Domain and TLS

1. **DNS.** Point the domain at the CDN (CNAME/ALIAS as ParsPack CDN instructs), or for a first test, A/AAAA records directly at the server.
2. **Certificate (origin).** Before enabling the HTTPS server blocks, issue a certificate with the HTTP-01 webroot challenge:
   ```bash
   # temporarily comment out the two `listen 443` server blocks, then:
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot certonly --webroot -w /var/www/certbot -d <your-domain> -d www.<your-domain>
   # restore the 443 blocks
   sudo nginx -t && sudo systemctl reload nginx
   systemctl list-timers | grep certbot      # renewal timer is installed by the package
   ```
   Add `--deploy-hook "systemctl reload nginx"` so renewals reload Nginx. If HTTP-01 cannot reach the origin through the CDN, use a DNS-01 challenge, or a CDN-issued origin certificate.
3. **Edge TLS.** Enable HTTPS on the CDN with "full (strict)" mode to the origin, then enable HSTS in Nginx (commented line) once every subdomain serves HTTPS.

## 8. Deploying updates and rolling back

```bash
cd /opt/kasra
deploy/scripts/deploy.sh                  # build origin/main, replace web-1 then web-2, auto-rollback on failure
deploy/scripts/deploy.sh v1.2.0           # any git ref
deploy/scripts/rollback.sh                # back to the previously running image
deploy/scripts/rollback.sh 3f2a9c1        # or a specific kept image (docker images kasra-frontend)
```

`deploy.sh` keeps the last 5 images for instant rollbacks. While one replica restarts, Nginx sends traffic to the other.

**Building elsewhere** (recommended when the server cannot reach registries reliably):

```bash
# CI or a workstation
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://<domain> -t kasra-frontend:$(git rev-parse --short HEAD) .
docker save kasra-frontend:<tag> | gzip | ssh deploy@server 'gunzip | docker load'
# server
KASRA_TAG=<tag> docker compose up -d --no-build web-1 && KASRA_TAG=<tag> docker compose up -d --no-build web-2
```

**Version skew.** Assets are content-hashed and both replicas run the same build after a deploy. With more instances or blue/green, set Next.js `deploymentId` (from the image tag) so clients on an old build do a hard navigation instead of requesting missing chunks.

## 9. CDN integration and caching

| Path | CDN behaviour | Source of truth |
|---|---|---|
| `/_next/static/*` | Cache 1 year, immutable | Nginx header |
| `/_next/image*` | Cache, honour origin headers (30 days); **cache key must include the full query string and vary by `Accept`** (or let the origin negotiate on every miss) | Next.js + Nginx |
| `/images/*`, `/og-image.jpg`, icons, manifest | Cache 30 days | `next.config.ts` headers |
| Static pages (`/`, `/product/*`, content pages) | Honour origin `Cache-Control: s-maxage=300, stale-while-revalidate=…` | Next.js |
| `/shop`, `/category/*`, `/search` | Origin sends `private, no-store` (request-time results): **do not cache** | Next.js |
| `/cart`, `/checkout`, `/account`, `/wishlist` | Static shells with no personal data; cacheable, but bypassing is also fine | Next.js |
| `/api/search`, `/api/products/*`, `/api/catalog/summary` | Short public TTLs (30–300 s) from the origin | Route handlers |
| `/api/health` | Never cache | `no-store` |

Rules that must hold on the CDN:

- **Respect origin `Cache-Control`** and do not cache responses that set cookies or carry `private`/`no-store`.
- **Keep the query string in the cache key.** Next.js uses the `_rsc` parameter to separate HTML from React Server Component payloads. Forward the `RSC`, `Next-Router-State-Tree`, `Next-Router-Prefetch`, `Next-Router-Segment-Prefetch` and `Next-Url` request headers unchanged.
- **Purge on deploy** is optional for hashed assets but advisable for HTML. Once the backend calls `revalidateTag()` for price or stock changes, also purge the affected product URLs at the CDN, because CDN copies otherwise live until `s-maxage` expires.
- **Never cache** authenticated pages, order data, checkout or payment callbacks (future backend). Keep those under `/api/` or `/account` paths with `private, no-store`.
- Configure Nginx `set_real_ip_from` with the CDN's published ranges so rate limits and logs see client IPs, never `0.0.0.0/0`.
- Enable the CDN WAF managed rules and bot protection. Keep the origin's own rate limits as a second layer.

**Optional micro-cache for parameter-free listings.** `/category/<slug>` and `/shop` without a query string render the same HTML for everyone. If campaign load ever makes them a bottleneck, Nginx can cache only those exact URLs for 30–60 s for HTML requests without an `RSC` header or cookies. Leave this off until the pages render user-specific content, and re-evaluate before adding any.

## 10. Resource allocation (8 vCPU / 16 GB)

| Component | CPU limit | Memory limit / reservation | Notes |
|---|---|---|---|
| OS, sshd, monitoring agents | — | ~1.5 GB | Keep headroom; don't allocate all RAM to containers |
| Nginx (host) | — | ~200 MB | Plus up to 5 GB **disk** image cache |
| `web-1`, `web-2` (Next.js) | 2.0 each | 1.5 GB / 512 MB each | Node heap 1 GB; one event loop per container |
| **Current total** | 4 vCPU | 3 GB | Leaves ~4 vCPU / 11 GB free |
| Future `api` | 2.0 | 2 GB / 512 MB | |
| Future PostgreSQL | 2.0 | 4 GB / 2 GB | `shared_buffers=1GB`, `effective_cache_size=3GB` |
| Future Redis | 0.5 | 512 MB | `maxmemory 384mb`, `allkeys-lru` |

Limits are ceilings, not reservations; reservations sum to well under 8 vCPU and 16 GB. Adjust using real monitoring data. If a Next.js container sustains more than 70 % of its CPU limit at peak, add a third replica (another service on `127.0.0.1:3003` plus an `upstream` line) before raising limits, because a single Node process uses about one core. If memory stays below 40 % of its limit, lower the limit to free room for PostgreSQL's page cache.

## 11. Health checks, monitoring and logs

- **Liveness:** Docker health check (`/api/health` every 30 s) and Compose `restart: unless-stopped`. `docker compose ps` shows health.
- **External uptime:** probe `https://<domain>/api/health` and `/` every minute from outside the server (e.g. Uptime Kuma on a separate small VPS), or run `deploy/scripts/healthcheck.sh` from cron with an alert command.
- **Metrics:** start with **Netdata** (one command, low overhead), or Prometheus + node-exporter + cAdvisor + Grafana for long-term retention. Alert on: CPU > 80 % for 10 min, memory > 85 %, **disk > 75 % of 150 GB**, container restarts, 5xx rate > 1 %, p95 upstream time > 1 s (from the `urt=` field in the Nginx log).
- **Logs:** container logs are capped by Docker (20 MB × 5 per container). Ubuntu's `logrotate` rotates `/var/log/nginx/*.log` daily (keep 14 days). Cap the journal with `SystemMaxUse=1G` in `/etc/systemd/journald.conf`.
- **Disk hygiene:** `docker system df` weekly; `deploy.sh` prunes old images; the Nginx image cache is bounded by `max_size=5g`. Keep durable data only in named volumes or backed-up paths, never in container filesystems.
- **Real-user performance (future):** report Web Vitals with `useReportWebVitals` to a self-hosted endpoint once a privacy-reviewed analytics store exists. No third-party analytics are included.

## 12. Backup and recovery

*Today* the frontend holds no durable business data. Back up:

| What | How | Frequency |
|---|---|---|
| Source and history | Git remote (GitHub) + a mirror | every push |
| `/opt/kasra/.env.production` | Encrypted copy in the team's password manager | on change |
| `/etc/nginx/sites-available/kasra.conf`, `/etc/letsencrypt/` | `tar` to off-server encrypted storage | weekly / on change |
| Last good image | `docker save kasra-frontend:<tag>`, kept off-server | per release |

Recovery on a fresh VPS: §1–§7 with the backed-up env, Nginx config and certificates, then `deploy.sh <tag>` (about 15 minutes).

*Future (PostgreSQL)*: nightly logical dumps (`pg_dump -Fc`) **plus** continuous WAL archiving (e.g. pgBackRest or WAL-G) to S3-compatible object storage in a different location, with 7 daily / 4 weekly / 6 monthly retention, encryption and a **monthly restore drill** into a scratch container that verifies row counts and runs smoke queries. Redis is a cache only and is not backed up.

## 13. Keeping things updated

- OS: unattended security upgrades; monthly `apt full-upgrade` + reboot window.
- Docker Engine: update with OS packages; review release notes for breaking changes.
- Base image: rebuild monthly (`docker build --pull`) to pick up Node.js 22 patch releases; pin a digest in `NODE_IMAGE` for reproducible builds.
- Dependencies: `npm outdated` / `npm audit` monthly; upgrade Next.js minor releases after running `npm run check` and the Playwright suite.

## 14. Load testing

`deploy/load-test/k6-storefront.js` simulates browsing sessions (home → category → filtered listing → product + quick-add data → search suggestions) with pass/fail thresholds (error rate < 1 %, page p95 < 800 ms, API p95 < 300 ms):

```bash
k6 run -e BASE_URL=https://staging.<domain> -e PROFILE=smoke    deploy/load-test/k6-storefront.js
k6 run -e BASE_URL=https://staging.<domain> -e PROFILE=normal   deploy/load-test/k6-storefront.js   # ~10 sessions in flight
k6 run -e BASE_URL=https://staging.<domain> -e PROFILE=campaign deploy/load-test/k6-storefront.js   # ramps to 300 sessions
```

- Run the **origin test** (bypassing the CDN, from a machine near the server, not on it) to find server capacity, and a **CDN test** to validate cache hit ratios.
- Sizing reference: 100,000 visits/day averages about 1.2 visits/s; campaign peaks are often 10–20× the average within a short window. Each visit typically loads 2–4 listing pages, which are request-time renders.
- Lab numbers from the sandbox are in `docs/performance-report.md`. They were measured on a different machine and do not prove capacity on the ParsPack server. Repeat the k6 runs there before announcing a campaign.

## 15. Scaling beyond one server

1. **Vertical first**: more replicas per server (one Node process per core is the practical ceiling), then a larger VPS.
2. **Separate data tier**: move PostgreSQL to a dedicated server or managed instance with private networking; keep the app servers stateless.
3. **Horizontal**: CDN → load balancer → N app servers, each running the same image. Required changes:
   - shared Next.js cache: a custom `cacheHandlers` implementation on Redis for `"use cache: remote"` entries, with `refreshTags()` so `revalidateTag()` on one instance invalidates all;
   - the same `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` and `deploymentId` on every instance (if Server Actions are introduced);
   - sticky sessions are **not** needed: client state lives in the browser and future sessions in Redis/PostgreSQL.
4. Avoid Kubernetes until there are several services and a team to operate it. Compose plus a load balancer covers this growth path.

## 16. Security checklist

- [x] App containers bound to `127.0.0.1`, non-root, capabilities dropped, `no-new-privileges`
- [x] No secrets in Git, build args or images; `.env*` ignored by Git and Docker
- [x] Security headers (nosniff, referrer policy, frame options, permissions policy); dotfiles denied
- [x] Rate limits and connection limits at Nginx; WAF at the CDN
- [ ] Real-IP ranges configured for the CDN; origin firewall restricted to CDN ranges
- [ ] HSTS enabled after HTTPS is verified everywhere
- [ ] Content-Security-Policy: add once third-party origins (payment gateway, analytics) are known; nonce-based CSP requires request-time rendering for all pages
- [ ] Backups encrypted and restore-tested (once a database exists)
