Recommended node version: `v10.15.3`

Install dependencies:
```
yarn install
```

Start local server:
```
DEBUG=blockstack-web:* npm start
```

Start local server with access to "production" data:
```
APP_DOMAIN=https://envelop.app DEBUG=blockstack-web:* npm start
```

Open in  browser:
```
http://localhost:3000
```

Test with sample file (previously uploaded):
```
http://localhost:3000/d/joaodiogocosta.id.blockstack/hello
```
