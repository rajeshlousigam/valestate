# Estara Properties — Mobile (iOS + Android)

React Native app for **Estara Properties** — the verification-first real-estate marketplace for Imphal.
Built with **Expo + expo-router + NativeWind**, it mirrors the web app's design language
(Manipur emerald/teal + gold, glass surfaces, the Verified-badge trust UI, INR lakh/crore). Integrated with the Estara API at `control.estaraimphal.com`.

## Quick start
```bash
cd mobile
npm install --legacy-peer-deps      # RN peer ranges need this with npm 11
npx expo start                      # press i (iOS sim) / a (Android emulator), or scan in Expo Go
```
Requires the **Expo Go** app (or a dev build) on a device/simulator.

## Scripts
| Command | What |
|---|---|
| `npm start` | Expo dev server |
| `npm run ios` / `npm run android` | open on a simulator/emulator |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `expo lint` |

## API
Talks to the **Estara REST API** (`docs/Auth API Docs.docx`, `docs/Property_and_Master_APIs.docx`).
Copy `.env.example` → `.env` (defaults point at production):
```
EXPO_PUBLIC_API_BASE_URL=https://control.estaraimphal.com/api/web/v1
EXPO_PUBLIC_ASSET_BASE_URL=https://control.estaraimphal.com/docs
```
- Client: `lib/api.ts` (envelope `{status,msg}`; HTTP 200 + `fail` on a list = empty result).
- Hooks: `lib/listings.ts` (TanStack Query; masters cached 1h like the server).
- Auth: phone OTP (`lib/auth.tsx`); bearer token + `{name, phone}` in `expo-secure-store`.
  No refresh endpoint — any 401 clears the session.

## What's inside
- **Explore:** banners, browse-by-purpose (real-estate types), latest site-visit + enquiry listings.
- **Search:** text search (`searchprop`) or dependent filters (`filterprop`: purpose → property type/budget,
  state → district), infinite scroll. The API can't combine text + filters, so filters disable the text box.
- **Detail:** gallery, features, how-we-verify panel; **Send enquiry** or **Book site visit** (today's slots).
- **Activity:** site-visit bookings + enquiries (`myhistory`). **Saved:** local only (no API).
- **Owner:** listing request form (`propertylistingrequest`) + request history.
- **Account:** phone-OTP login, 3-step signup, profile update, phone-number change (forces re-login).

## Design parity
`tailwind.config.js` + `global.css` re-declare the web's exact HSL tokens under the **same class
names** (`bg-surface`, `text-brand`, `border-line`, `bg-brand-soft`, …), so components read like the
web. Light/dark follows the device. Glass = `expo-blur`; brand gradient = `expo-linear-gradient`;
the web WebGL `SpecularButton` is reimplemented natively with the same look + API.

## Building for devices (EAS)
```bash
npm i -g eas-cli
eas build --profile preview --platform ios      # or android
```
See `eas.json` for the `development` / `preview` / `production` profiles.

## Notes
- NativeWind is pinned to **4.1.23** (4.2.x pulls `react-native-worklets`, which conflicts with
  SDK 52's reanimated 3.16 at bundle time).
- Push notifications, biometric app-lock, and map/geo search are scaffolded but **Phase 2** (doc 17).
- The listing-request API takes no photos/documents; verification collects them offline.
