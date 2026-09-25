# Budget Tracker

A household budget and cash-flow tracker built with React and Vite. It runs as a desktop app (via Electron) and saves your data to a file on your computer.

## Features

- **Overview**: monthly income against essential and discretionary spending, a breakdown by category, and your surplus or shortfall.
- **Savings runway**: when expenses exceed income, shows how many months your savings would last.
- **Income scenarios**: turn income sources (a second job, unemployment benefits, a bonus) on and off to see "what if" situations.
- **Essential and discretionary expenses**: add, edit and delete line items grouped by category.
- **Planned items**: track one-time expenses and income such as a vacation, a tuition payment or an emergency fund.
- **Saves automatically**: every change is saved as you make it, and your data is there next time you open the app.

## Running the desktop app

```bash
npm install
npm run package
```

This builds `release/mac-arm64/Budget Tracker.app`. Drag it into your Applications folder and open it like any other app.

To build and launch from source without packaging, run `npm run app`.

### Where your data is saved

On macOS, the data file is:

```
~/Library/Application Support/Budget Tracker/budget-data.json
```

Rebuilding or updating the app doesn't touch this file.

### Backing up

- **Export** saves a copy of your budget as a JSON file wherever you choose.
- **Import** loads a previously exported file. It replaces your current data after you confirm.
- **Show Data File** opens the data folder in Finder.

## Development

```bash
npm run dev    # start the Vite dev server in the browser (data saved to localStorage)
npm run lint   # run ESLint
```

## Project structure

```
src/App.jsx          The budget tracker UI and logic
src/storage.js       Storage layer: the Electron data file, or localStorage in a browser
electron/main.cjs    Electron main process: window setup and reading/writing the data file
electron/preload.cjs Securely exposes the storage API to the React app
build/icon.png       App icon (electron-builder converts it to .icns)
```

## Tech stack

React 19, Vite, Electron, electron-builder
