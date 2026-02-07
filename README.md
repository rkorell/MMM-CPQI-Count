# MMM-CPQI-Count

A [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module that displays survey participation counts from the Cisco Partner Quality Index (CPQI) system in a hierarchical tree view.

Backend: [PartnerAnalyse](https://github.com/rkorell/PartnerAnalyse)

## Features

- Hierarchical tree display of survey participation counts
- Configurable detail level (depth of tree)
- Optional Cisco Partner logo
- Configurable root node (e.g. filter by organization)

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/rkorell/MMM-CPQI-Count.git
```

No `npm install` required — this module has no external dependencies.

## Configuration

```js
{
    module: "MMM-CPQI-Count",
    position: "bottom_right",
    config: {
        serverAddress: "YOUR_SERVER_IP",
        root: null,
        detailLevel: 1,
        showLogo: true,
        title: "CPQI",
        updateInterval: 900000
    }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `serverAddress` | string | `""` | IP or hostname of the CPQI server (required) |
| `root` | string | `null` | Root node filter (e.g. `"SLED"`) |
| `detailLevel` | int | `1` | Tree depth (1 = root only, 2 = +children, 3 = all) |
| `showLogo` | bool | `false` | Show Cisco Partner logo next to title |
| `title` | string | `"CPQI - Anzahl"` | Module header text |
| `updateInterval` | int | `300000` | Update interval in ms (default: 5 min) |

### Detail Level Example

With `root: null` (full tree):

- **detailLevel: 1** → `Public: 4`
- **detailLevel: 2** → Public + SLED, Federal, Healthcare
- **detailLevel: 3** → All levels including SLED-Mitte, Sovereignity, etc.

## API Endpoint

The module fetches data from `http://<serverAddress>/php/MagicMirrorModuleStats.php`, optionally with `?root=SLED` parameter.

## License

MIT — Dr. Ralf Korell
