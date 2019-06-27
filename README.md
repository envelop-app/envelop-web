![Envelop](https://envelop.app/images/logo.svg)

# Web app 🌐

![Envelop - Share and upload private files easily](https://envelop.app/images/og-image.png)

Share private files easily, without losing their ownership.

With [Blockstack](https://blockstack.org), you decide where your files are stored.
Use the default storage (infinite space with a 25MB file limit), or setup your own storage.

## Features

- Upload a file (from the file browser or from other apps)
- Get a short URL to share, so other can download your file
- Delete files you no longer need or want to share

## Contributing

### Setup

- Make sure `node` is available. Recommended version is `v12.3.0`.
- Make sure `docker` and `docker-compose` is available.

Run containers
```
docker-compose up
```

Install dependencies:
```
yarn install
```

Start local server:
(available at http://localhost:3000, ignore netlify's cli output)
```
npm run netlify-local
```

Open in  browser:
```
http://localhost:3000
```

### Guide

1. Fork it ( https://github.com/envelop-app/envelop-web )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

Envelop is under MIT License.

---

Created by [bloco.io](https://www.bloco.io) and [@joaodiogocosta](https://twitter.com/joaodiogocosta).
