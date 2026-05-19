# CP3 — Geolocalização GPS

## O que foi feito

Adicionada captura de GPS ao fluxo de escaneamento de código de barras. Quando o usuário escaneia um produto, a localização atual é capturada automaticamente e salva junto com os dados do produto no Firebase.

---

## Configuração necessária antes de rodar

O projeto usa variáveis de ambiente para as credenciais do Firebase. **Sem isso o app não conecta.**

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Abra o `.env` e preencha com os valores do seu projeto no [Firebase Console](https://console.firebase.google.com):
```env
EXPO_PUBLIC_FIREBASE_API_KEY=SUA_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=SEU_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID=SEU_PROJECT_ID
EXPO_PUBLIC_FIREBASE_DATABASE_URL=SUA_DATABASE_URL
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=SEU_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=SEU_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=SEU_APP_ID
```

> O prefixo `EXPO_PUBLIC_` é obrigatório para o Expo expor a variável no bundle do app.
> O arquivo `.env` está no `.gitignore` — nunca suba suas chaves no repositório.

---

## Arquivos alterados

### `package.json` + `package-lock.json`
Instalação do pacote `expo-location` (compatível com Expo Go / SDK 54).

```bash
npx expo install expo-location
```

---

### `src/screens/BarcodeScannerScreen.js`

Após ler o código de barras, a função `handleBarcodeScanned` agora:

1. Solicita permissão de localização em foreground
2. Captura latitude e longitude do dispositivo
3. Passa `scannedLocation` junto com o barcode na navegação para a HomeScreen

```js
import * as Location from "expo-location";

async function handleBarcodeScanned({ data }) {
  const { status } = await Location.requestForegroundPermissionsAsync();

  let location = null;
  if (status === "granted") {
    const currentLocation = await Location.getCurrentPositionAsync({});
    location = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };
  }

  navigation.navigate("Home", {
    scannedBarcode: data,
    scannedLocation: location,   // <-- novo
    ...
  });
}
```

---

### `src/screens/HomeScreen.js`

**Estado adicionado:**
```js
const [location, setLocation] = useState(null);
```

**Recebe a localização vinda do scanner:**
```js
useEffect(() => {
  if (route.params?.scannedBarcode) {
    setBarcode(String(route.params.scannedBarcode));
    setLocation(route.params.scannedLocation || null); // <-- novo
  }
}, [route.params?.scannedBarcode]);
```

**Salva no Firebase com o campo `location`:**
```js
const productData = {
  name: name.trim(),
  price: price.trim(),
  barcode: barcode ? String(barcode).trim() : "",
  ...(location && { location }),  // <-- novo (só inclui se existir)
};
```

**Exibe as coordenadas no card do produto:**
```jsx
{item.location ? (
  <Text>Localização: {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}</Text>
) : (
  <Text>Localização: Não informada</Text>
)}
```

---

## Estrutura salva no Firebase

```json
{
  "name": "Nome do Produto",
  "price": "R$ 10,00",
  "barcode": "7891234567890",
  "location": {
    "latitude": -23.55052,
    "longitude": -46.633308
  }
}
```

---

## Fluxo completo

```
Usuário aponta câmera
      ↓
Código de barras lido
      ↓
Permissão de GPS solicitada
      ↓
Latitude + Longitude capturadas
      ↓
Navega para HomeScreen com barcode + location
      ↓
Usuário preenche nome e preço
      ↓
Produto salvo no Firebase com campo location
```
