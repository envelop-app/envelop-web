Recommended node version: `v12.3.0`

Install dependencies:
```
yarn install
```

Run docker-compose:
```
docker-compose up
```

Start local server with access to production data:
(available at http://localhost:3000, ignore netlify's cli output)
```
npm run netlify-local
```

Start live demo server with access to production data:
```
npm run netlify-live
```

Open in  browser:
```
http://localhost:8888
```

Test with sample file (the following is just an example, it doesn't necessarily
work):
```
http://localhost:3000/d/joaodiogocosta.id.blockstack/hello
```
