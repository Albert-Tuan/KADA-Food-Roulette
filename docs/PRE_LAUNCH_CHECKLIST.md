# Pre-Launch Checklist

> **Use this checklist trước khi launch v1.0 lên App Store + Google Play**
> **Date created:** 2026-08-11
> **Owner:** Tuấn Anh (PM) + Thành Nam (DevOps)

---

## 1. Technical Readiness

### 1.1 Backend
- [ ] All migration files reviewed
- [ ] Production database provisioned (Railway/PlanetScale)
- [ ] Connection pooling configured
- [ ] Auto-scaling configured
- [ ] Health check endpoint (`/health`)
- [ ] Structured logging (JSON format)
- [ ] Error tracking (Sentry equivalent)
- [ ] Performance benchmarks meet SLA (< 200ms p95)

### 1.2 Mobile App (iOS)
- [ ] App tested on iPhone 12, 13, 14, 15
- [ ] Tested on iPad (basic)
- [ ] iOS 16+ supported
- [ ] Privacy labels configured
- [ ] Camera + Location permission strings reviewed
- [ ] Deep linking tested (foodroulette://)
- [ ] Push notification setup (v1.2)
- [ ] App icon set (1024x1024)

### 1.3 Mobile App (Android)
- [ ] Tested on Android 10, 12, 14
- [ ] Tested on Samsung, Xiaomi, Pixel
- [ ] Required permissions documented
- [ ] Adaptive icons set
- [ ] Background restrictions documented

### 1.4 Web (Steward Dashboard)
- [ ] All steward pages tested
- [ ] Moderation queue works with real data
- [ ] Authentication + role check works
- [ ] Error states handled

---

## 2. Security & Privacy

- [ ] HTTPS everywhere (TLS 1.2+)
- [ ] All user data encrypted at rest
- [ ] Secrets not in code (.env.example only)
- [ ] JWT secret rotated (auto-rotation in production)
- [ ] Rate limiting active on:
  - [ ] Auth (5 failed attempts → 15min lock)
  - [ ] Geo endpoint (60/min)
  - [ ] AI advisor (50/day)
- [ ] Input validation (no SQL injection, XSS)
- [ ] CORS configured properly
- [ ] Audit log cho sensitive actions
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR/CCPA compliance check

---

## 3. Performance & Scalability

### 3.1 Load Testing
- [ ] Tested với 1000 concurrent users
- [ ] Tested với 100 concurrent groups
- [ ] Database queries < 100ms p95
- [ ] API responses < 500ms p95

### 3.2 Monitoring
- [ ] Error rate monitored (< 0.1%)
- [ ] Latency monitored p50, p95, p99
- [ ] Crash rate monitored (mobile + web)
- [ ] Database connection pool monitored
- [ ] Disk usage monitored (> 80% alert)
- [ ] Cost monitored (daily budget)

### 3.3 Auto-scaling
- [ ] Backend can scale horizontally (2-10 instances)
- [ ] Database connection pool scales
- [ ] CDN configured for static assets

---

## 4. Business & Legal

### 4.1 App Store Submission
- [ ] App Store Connect app created
- [ ] Bundle ID registered (`com.foodroulette.app`)
- [ ] Privacy policy URL live
- [ ] Terms of service URL live
- [ ] Support URL configured
- [ ] Marketing URL (optional)
- [ ] App description (Vietnamese + English)
- [ ] Keywords (≤100 chars)
- [ ] Screenshots (iPhone 6.7", 6.5", iPad)
- [ ] Age rating questionnaire
- [ ] App icon (no transparency, 1024x1024)
- [ ] Copyright info

### 4.2 Google Play Submission
- [ ] Google Play Console project
- [ ] Service account JSON configured
- [ ] Internal testing track ready
- [ ] App description (Vietnamese + English)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots
- [ ] Content rating

### 4.3 Legal Documents
- [ ] Privacy Policy published (Vietnamese)
- [ ] Terms of Service (Vietnamese)
- [ ] Cookie Policy (web only)
- [ ] Data Processing Agreement (for B2B)

---

## 5. Operations

### 5.1 CI/CD
- [ ] GitHub Actions setup
- [ ] Auto-test on PR
- [ ] Auto-deploy preview on PR
- [ ] Manual approval for production deploy
- [ ] Rollback procedure tested

### 5.2 Runbooks
- [ ] Database failover procedure
- [ ] Service restart procedure
- [ ] Manual moderation escalate procedure
- [ ] User data export/delete procedure (GDPR)
- [ ] Incident response plan

### 5.3 Backup & Recovery
- [ ] Daily DB backups (automated)
- [ ] Backup tested (restore verified)
- [ ] RPO ≤ 24h
- [ ] RTO ≤ 4h

---

## 6. Marketing & Launch

### 6.1 Pre-Launch
- [ ] Landing page live (foodroulette.app)
- [ ] Social media accounts ready
- [ ] Press kit prepared (logo, screenshots)
- [ ] Beta testers recruited (50-100 users)
- [ ] Beta feedback incorporated

### 6.2 Day-1 Launch
- [ ] App goes live on stores
- [ ] Social media announcement
- [ ] Email to beta users
- [ ] Monitoring dashboards verified
- [ ] Support channels active (Zalo/email)

### 6.3 Post-Launch (Week 1)
- [ ] Daily monitoring (crashes, errors)
- [ ] User feedback review
- [ ] Critical bugs prioritized
- [ ] Hot fixes if needed
- [ ] Week 1 retrospective

---

## 7. Documentation

- [ ] API documentation published
- [ ] User help center (Vietnamese)
- [ ] FAQ (Vietnamese)
- [ ] Admin guide for stewards
- [ ] Architecture decision records (ADR) published

---

## 8. Quality Gate (Must pass)

**Before code freeze (T-3 days):**
- [ ] All Critical bugs fixed
- [ ] Test coverage ≥ 70%
- [ ] No P0/P1 bugs in backlog
- [ ] Code review complete (>80% PRs reviewed)

**Before submission (T-1 day):**
- [ ] TestFlight internal testing passed
- [ ] Beta testing 2 weeks completed
- [ ] Crash-free rate ≥ 99% on beta
- [ ] Performance SLA met

---

## 9. Sign-Off

| Role | Name | Sign-off Date |
|------|------|---------------|
| PM | Tuấn Anh | ___ |
| Tech Lead | (Trường) | ___ |
| Mobile Lead | (Hoàng Hiếu) | ___ |
| DevOps | (Thành Nam) | ___ |
| Locket Lead | (Gia Bình) | ___ |

---

*Maintained by: Tuấn Anh (PM)*
*Last updated: 2026-08-11*