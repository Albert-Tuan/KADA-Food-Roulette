# EAS Build & Submit Configuration

> **Owner:** Tuấn Anh + Thành Nam
> **Last updated:** 2026-08-11

This document explains the EAS configuration for Food Roulette mobile app.

---

## Build Profiles

### `development`
- **Purpose:** Local development with dev client
- **Distribution:** Internal (only team)
- **Bundle ID:** `com.foodroulette.app.dev`
- **Channel:** `development`
- **Use case:** Testing on simulator/device with hot reload

**Build command:**
```bash
cd apps/mobile
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

### `development:device`
- **Purpose:** Development build for physical device testing
- **Distribution:** Internal
- **Bundle ID:** `com.foodroulette.app.dev`
- **Use case:** Test on real device without going through store

### `preview`
- **Purpose:** Internal testing / QA builds
- **Distribution:** Internal (TestFlight for iOS, Internal track for Android)
- **Bundle ID:** `com.foodroulette.app.preview`
- **Channel:** `preview`
- **Use case:** Share with QA team / stakeholders before public release

**Build command:**
```bash
npx eas build --profile preview --platform ios
npx eas build --profile preview --platform android
```

### `production`
- **Purpose:** Public store release
- **Distribution:** App Store / Google Play
- **Bundle ID:** `com.foodroulette.app`
- **Channel:** `production`
- **Auto-increment:** Yes (build number bumps automatically)
- **Use case:** Submit to App Store / Google Play

**Build command:**
```bash
npx eas build --profile production --platform ios
npx eas build --profile production --platform android
```

---

## Submit Profiles

### `production` Submit

#### iOS (App Store Connect)

Required setup:
1. **App Store Connect API Key** (recommended) hoặc Apple ID + App-specific password
2. **ASC App ID:** Lấy từ App Store Connect URL sau khi tạo app
3. **Apple Team ID:** Lấy từ Apple Developer account

**Setup steps:**

```bash
# Login to EAS
npx eas login

# Configure credentials
npx eas credentials:configure --platform ios
```

**Submit command:**
```bash
npx eas submit --platform ios --latest
```

#### Android (Google Play)

Required setup:
1. **Google Service Account JSON** - Tạo tại Google Cloud Console
2. **Grant access** - Cho service account quyền Release Manager trên Google Play Console
3. **Save JSON** tại `apps/mobile/google-service-account.json` (ĐÃ gitignored)

**Setup steps:**

```bash
# Configure credentials
npx eas credentials:configure --platform android
```

**Submit command:**
```bash
npx eas submit --platform android --latest
```

---

## Secrets cần setup trên EAS dashboard

| Secret | Description | Example |
|--------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | `https://api.foodroulette.com` |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | (use environment-specific) |
| `SENTRY_AUTH_TOKEN` | Sentry upload auth | (from Sentry dashboard) |

**Setup:**
```bash
npx eas env:create --name EXPO_PUBLIC_API_URL --value "https://api.foodroulette.com" --environment production
npx eas env:create --name EXPO_PUBLIC_API_URL --value "https://staging-api.foodroulette.com" --environment preview
```

---

## Workflow Tuấn Anh + Thành Nam

### Tuấn Anh (PM):
- Approve builds trước khi submit
- Verify version numbers
- Coordinate với stakeholders

### Thành Nam (DevOps):
- Setup credentials
- Monitor CI/CD pipeline
- Maintain `eas.json` config
- Handle post-submission issues

---

## Pre-Submit Checklist

Trước khi submit lên store, kiểm tra:

**App metadata:**
- [ ] App name đúng
- [ ] Description (Vietnamese + English)
- [ ] Screenshots (iPhone 6.7", iPhone 6.5", iPad 12.9"; Android phone, tablet)
- [ ] App icon (1024x1024 PNG, no transparency)
- [ ] Splash screen
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Keywords (comma separated, max 100 chars)
- [ ] Categories (primary + secondary)
- [ ] Age rating questionnaire
- [ ] Copyright info

**Technical:**
- [ ] Version number bumped
- [ ] Build number incremented
- [ ] All E2E tests pass
- [ ] Lighthouse score > 80
- [ ] No critical bugs trong tracker
- [ ] Crash-free rate > 99% (existing builds)

**Legal:**
- [ ] Privacy policy reviewed
- [ ] Terms of service reviewed
- [ ] GDPR / CCPA compliant
- [ ] Data collection disclosure accurate

---

## Channels & Updates

EAS Update cho phép push OTA updates cho JS bundle (không cần re-submit native).

```bash
# Push update cho production channel
npx eas update --branch production --message "Fix login bug"
```

**Channels:**
- `development` - Local dev
- `preview` - Internal testing
- `production` - Live users

---

## Troubleshooting

### Build fails
1. Check EAS dashboard logs
2. Verify dependencies are compatible với Expo SDK 57
3. Check `app.json` plugins correct
4. Review build artifacts

### Submit fails
1. Check credentials valid
2. Verify metadata complete
3. Check App Store Connect / Google Play Console không có warnings
4. Review build không bị "Invalid" status

### OTA Update fails
1. Verify channel name correct
2. Check JS bundle compatible với native build
3. Review EAS Update logs

---

## References

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [EAS Update Docs](https://docs.expo.dev/eas-update/introduction/)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)
- [Google Play Console](https://play.google.com/console)

---

*Maintained by: Tuấn Anh (PM) + Thành Nam (DevOps)*