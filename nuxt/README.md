# SPC Display - Digital Signage

En enkel digital signage-lösning som visar bilder från Google Drive på TV-skärmar.

## URLs

- **Stående skärmar**: `https://spc.simonbrundin.com` - Visar en bild i taget
- **Liggande skärmar**: `https://spc.simonbrundin.com/liggande` - Visar två bilder bredvid varandra

## Setup

### 1. Google Cloud Setup

1. Gå till [Google Cloud Console](https://console.cloud.google.com/)
2. Skapa ett nytt projekt eller välj ett befintligt
3. Aktivera Google Drive API:
   - Gå till "APIs & Services" > "Library"
   - Sök efter "Google Drive API"
   - Aktivera den
4. Skapa en Service Account:
   - Gå till "APIs & Services" > "Credentials"
   - Klicka på "Create Credentials" > "Service Account"
   - Ge den ett namn (t.ex. "display-signer")
   - Skapa och ladda ner JSON-nyckeln
5. Dela din Google Drive-mapp:
   - Öppna mappen med bilderna
   - Dela med service accountens e-postadress (står i JSON-filen som `client_email`)
   - Ge "Viewer"-behörighet

### 2. Miljövariabler

```bash
cp .env.example .env
```

Redigera `.env`:

```env
GOOGLE_DRIVE_FOLDER_ID=1abc123...  # ID:t från Drive-URL:en
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}  # Hela JSON:en
SLIDE_INTERVAL=30000  # Millisekunder mellan bilder
```

### 3. Kör lokalt

```bash
npm install
npm run dev
```

Öppna:

- <http://localhost:3000> (stående)
- <http://localhost:3000/liggande> (liggande)

## Deployment

### Docker

```bash
docker build -t spc-display .
docker run -p 3000:3000 --env-file .env spc-display
```

### Kubernetes

Se `k8s/` mappen för Kubernetes manifests.

## Google Drive-mappstruktur

Bilderna sorteras alfabetiskt efter filnamn. Använd nummerprefix för att styra ordningen:

```
Affischer/
├── 01_ Sommarfest.jpg
├── 02_ Veckans meny.jpg
├── 03_ Info om lokalen.jpg
└── 04_ Kommande evenemang.jpg
```

## Bilder

- **Stående vy**: Visar en bild i taget, centrerad
- **Liggande vy**: Visar två bilder bredvid varandra (steg 2)

## Teknisk info

- **Framework**: Nuxt 4
- **API**: Nitro server routes
- **Caching**: 60 sekunder på servern för att undvika rate limits
- **Uppdatering**: Sidan uppdaterar automatiskt var 60:e sekund
