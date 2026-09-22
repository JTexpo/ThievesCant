# Thieves' Cant

A lightweight, browser-based translator and reference tool for **Thieves' Cant**.

Translate English into Thieves' Cant, decrypt Cant back into English, or browse the complete vocabulary through the built-in glossary.

## Features

- **English → Thieves' Cant**
  - Translate words and phrases using the included dictionary.
  - Automatically preserves capitalization.
  - Supports multiple Cant terms for the same English word.
  - Optionally randomizes between available Cant terms.

- **Thieves' Cant → English**
  - Reverse-translate known Cant terms back into English.
  - Handles phrases before individual words to improve translation accuracy.

- **Searchable Glossary**
  - Browse the complete Thieves' Cant dictionary.
  - Search by either English or Cant terminology.
  - Displays all known alternatives for each entry.

- **Quality-of-life features**
  - Copy translated text to the clipboard.
  - Clear the current translation.
  - Swap translation direction.
  - `Ctrl + Enter` / `Cmd + Enter` to translate or decrypt.

## Demo

**[Open Thieves' Cant](https://jtexpo.github.io/ThievesCant/)**

> If the repository is being served through a different GitHub Pages URL, replace the link above with the appropriate deployment URL.

## How It Works

Thieves' Cant is entirely client-side.

The application consists of a small collection of static files:

```text
ThievesCant/
├── index.html
├── app.js
├── style.css
└── thieves_cant_dictionary.json
```

The browser loads the dictionary and builds two lookup tables:

```text
English
   │
   ▼
English → Cant
   │
   ▼
Thieves' Cant
```

and:

```text
Thieves' Cant
   │
   ▼
Cant → English
   │
   ▼
English
```

No application server or database is required.

### Translation

When translating English into Cant, the application:

1. Loads the dictionary from `thieves_cant_dictionary.json`.
2. Builds an English → Cant lookup table.
3. Sorts entries by phrase length so longer phrases are processed first.
4. Searches the input using escaped regular expressions.
5. Replaces matching terms with their Cant equivalent.
6. Preserves the original capitalization.
7. Optionally chooses randomly between multiple Cant translations.

For example, if the dictionary contains several possible translations for a word, enabling **Use different Cant terms when available** allows the translator to select a different term each time.

### Decryption

Decryption works in the opposite direction.

The application builds a reverse lookup table:

```text
Cant term → English term(s)
```

When multiple English meanings exist for the same Cant term, the first available English meaning is currently used for automatic decryption. The glossary continues to display all known mappings.

## Running Locally

Because this is a static web application, there is no build system or backend required.

Clone the repository:

```bash
git clone https://github.com/JTexpo/ThievesCant.git
cd ThievesCant
```

Then serve the directory with any static HTTP server.

For example, with Python:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

### Why use a local server?

The application loads the dictionary with JavaScript's `fetch()` API:

```javascript
fetch("thieves_cant_dictionary.json")
```

Serving the project over HTTP avoids browser restrictions that can occur when opening `index.html` directly from the filesystem.

## Dictionary

The vocabulary is stored in:

```text
thieves_cant_dictionary.json
```

Entries use an English term as the key and one or more Cant terms as the value.

Conceptually:

```json
{
  "example": [
    "cant term",
    "alternative term"
  ]
}
```

A single translation can also be represented as a string.

The application normalizes these values into arrays internally, allowing both formats to work.

## Project Structure

### `index.html`

Defines the user interface, including:

- Translation/decryption tabs
- Input and output text areas
- Translation controls
- Copy and clear buttons
- Language swap button
- Glossary
- Glossary search

### `app.js`

Contains the application's functionality:

- Dictionary loading
- Lookup generation
- English → Cant translation
- Cant → English decryption
- Capitalization preservation
- Randomized translations
- Glossary rendering and searching
- Clipboard functionality
- UI state management

### `style.css`

Contains the complete visual styling for the application, including its dark interface, responsive layout, translator panels, controls, and glossary.

### `thieves_cant_dictionary.json`

The vocabulary database used by the translator and glossary.

## Translation Behavior

The translator attempts to match complete words and phrases rather than arbitrary substrings.

For example, entries are processed longest-first so that a phrase such as:

```text
red hand
```

can be matched before:

```text
hand
```

This helps prevent shorter dictionary entries from interfering with longer phrases.

Capitalization is also preserved:

```text
example
Example
EXAMPLE
```

will retain their respective capitalization patterns after replacement.

## Privacy

The application is designed to run entirely in the browser.

Your input is processed locally by the JavaScript application and is not sent to a project backend.

The dictionary itself is loaded as a static JSON file.

## Dependencies

There are currently no external JavaScript libraries or frameworks required.

The project uses:

- HTML
- CSS
- Vanilla JavaScript
- JSON
- Browser APIs such as `fetch()` and the Clipboard API

## GitHub Pages

The project is well suited to GitHub Pages because it is a static web application.

A typical deployment looks like:

```text
GitHub Repository
       │
       ▼
 GitHub Pages
       │
       ▼
 Static HTML / CSS / JS / JSON
       │
       ▼
   User's Browser
       │
       ▼
 Translation runs locally
```

There is no server-side translation component required.

## Contributing

Contributions to the dictionary and application are welcome.

For vocabulary additions, update:

```text
thieves_cant_dictionary.json
```

For application changes, the primary JavaScript implementation is located in:

```text
app.js
```

For visual changes, modify:

```text
style.css
```

When adding dictionary entries, try to preserve the existing JSON structure and avoid duplicate mappings where possible.
