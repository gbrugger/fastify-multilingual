# fastify-multilingual

[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)
[![CI](https://github.com/gbrugger/fastify-multilingual/actions/workflows/node.js.yml/badge.svg)](https://github.com/gbrugger/fastify-multilingual/actions/workflows/node.js.yml)
![NPM Version](https://img.shields.io/npm/v/fastify-multilingual)

A Fastify plugin that decorates requests with internationalization (i18n) capabilities using [Polyglot.js](https://airbnb.io/polyglot.js/). The plugin automatically detects user language preferences from `Accept-Language` headers and provides localized phrases with support for pluralization and nested phrase structures.

## Features

- 🌍 Automatic locale detection from `Accept-Language` headers
- 📦 Polyglot.js integration for powerful i18n features
- 🔄 Graceful fallback to default locale
- 🏗️ Support for nested phrase structures
- ⚡ Per-request polyglot instances for optimal performance
- 🛡️ TypeScript support with full type safety

## Compatibility

| Plugin Version | Fastify Version | Node.js Version |
| -------------- | --------------- | --------------- |
| `^0.1.0`       | `^5.0.0`        | `>=20.0.0`      |

## Installation

```bash
npm install fastify-multilingual
```

## Usage

### Basic Setup

```javascript
const fastify = require('fastify')({ logger: true });

// Define your phrases
const phrases = {
  en: {
    greeting: {
      hi: 'Hello',
      welcome: 'Welcome %{name}'
    },
    404: {
      not_found: 'Page not found'
    }
  },
  it: {
    greeting: {
      hi: 'Ciao',
      welcome: 'Benvenuto %{name}'
    },
    404: {
      not_found: 'Pagina non trovata'
    }
  }
};

// Register the plugin
await fastify.register(require('fastify-multilingual'), {
  multilingual: {
    phrases,
    defaultTranslation: 'en'
  }
});

// Use in routes
fastify.get('/', async (request, reply) => {
  const polyglot = request.polyglot;
  
  return {
    message: polyglot.t('greeting.hi'),
    welcome: polyglot.t('greeting.welcome', { name: 'World' }),
    availableTranslations: request.availableTranslations
  };
});

await fastify.listen({ port: 3000 });
```

### Organizing Phrases in Separate Files

For larger applications, it's recommended to organize phrases in separate files by locale. Here's how to structure your i18n files:

```
i18n/
├── index.js          # Combines all locale files
├── en.js             # English phrases
├── it.js             # Italian phrases
└── pt-BR.js          # Portuguese (Brazil) phrases
```

**Individual locale files:**

```javascript
// i18n/en.js
export const phrases = {
  greeting: {
    hi: 'Hello',
    welcome: 'Welcome %{name}'
  },
  404: {
    not_found: 'Page not found'
  },
  other: 'Not nested'
};
```

```javascript
// i18n/it.js
const phrases = {
  greeting: {
    hi: 'Ciao'
  },
  404: {
    not_found: 'Pagina non trovata'
  }
};

export default phrases;
```

**Index file to combine all locales:**

```javascript
// i18n/index.js
import { phrases as en } from './en.js';
import it from './it.js';
import { phrases as pt_BR } from './pt-BR.js';

export const phrases = {
  en: { ...en },
  it: { ...it },
  pt_BR: { ...pt_BR }
};
```

**Using in your Fastify application:**

```javascript
import fastify from 'fastify';
import fastifyMultilingual from 'fastify-multilingual';
import { phrases } from './i18n/index.js';

const app = fastify({ logger: true });

await app.register(fastifyMultilingual, {
  multilingual: {
    phrases,
    defaultTranslation: 'en'
  }
});
```

[See a complete example in the repository](./example/i18n/)

### TypeScript Usage

```typescript
import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyMultilingual, { NestedPhrases } from 'fastify-multilingual';

const app = fastify({ logger: true });

const phrases: NestedPhrases = {
  en: {
    greeting: { 
      hi: 'Hello',
      welcome: 'Welcome %{name}'
    }
  },
  it: {
    greeting: { 
      hi: 'Ciao',
      welcome: 'Benvenuto %{name}'
    }
  }
};

await app.register(fastifyMultilingual, {
  multilingual: {
    phrases,
    defaultTranslation: 'en'
  }
});

// TypeScript route with proper typing
app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  const { polyglot } : { polyglot: Polyglot } = request;
  
  return {
    message: polyglot.t('greeting.hi'),
    welcome: polyglot.t('greeting.welcome', { name: 'TypeScript' }),
    availableTranslations: request.availableTranslations
  };
});
```

## Configuration Options

The plugin accepts the following options:

### `multilingual`

| Property        | Type     | Required | Description |
| --------------- | -------- | -------- | ----------- |
| `phrases`       | `NestedPhrases` | Yes | Object containing locale-keyed phrase objects |
| `defaultTranslation` | `string \| null` | Yes | Fallback locale when user's preferred locale is unavailable |

### Phrases Structure

The `phrases` object supports nested structures:

```javascript
{
  "en": {
    "simple": "Simple message",
    "nested": {
      "deep": {
        "message": "Deeply nested message"
      }
    },
    "pluralization": "You have %{smart_count} message |||| You have %{smart_count} messages"
  }
}
```

## API Reference

The plugin decorates the Fastify request object with the following properties:

### `request.polyglot`

Returns a Polyglot instance configured for the user's detected locale.

```javascript
const polyglot = request.polyglot;
const message = polyglot.t('greeting.hi');
```

### `request.availableTranslations`

String containing comma-separated list of available locales.

```javascript
console.log(request.availableTranslations); // "en,it,pt-BR"
```

### `request['polyglot-{locale}']`

Access polyglot instances for specific locales:

```javascript
const englishPolyglot = request['polyglot-en'];
const italianPolyglot = request['polyglot-it'];
```

## Locale Detection

The plugin automatically detects the user's preferred locale using the following priority:

1. Parse `Accept-Language` header
2. Match against available locales (exact match first, then language family)
3. Fall back to `defaultTranslation`
4. If no default translation, return key-based responses

Example `Accept-Language` header processing:
- `en-US,en;q=0.9,it;q=0.8` → Prefers `en-US`, falls back to `en`, then `it`
- `pt-BR,pt;q=0.9` → Prefers `pt-BR`, falls back to `pt`

## Examples

### Running the Example

The repository includes a working example demonstrating the plugin:

```bash
# Start the example server
npm run example

# Test with different locales
npm run example:get
```

The example server runs on port 3000 and includes phrases in English, Italian, Portuguese (Brazil), and German (not present) fallback handling.

### Testing Different Locales

```bash
# Test English
curl -H "Accept-Language: en" http://localhost:3000/

# Test Italian  
curl -H "Accept-Language: it" http://localhost:3000/

# Test Portuguese (Brazil)
curl -H "Accept-Language: pt-BR" http://localhost:3000/

# Test fallback (German → English)
curl -H "Accept-Language: de" http://localhost:3000/
```

## Development

### Using with Dev Containers

This project supports [Development Containers](https://containers.dev/) for a consistent development environment. The devcontainer configuration includes Node.js 20, npm, and all necessary development tools.

**Using with VS Code:**
1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the project in VS Code
3. When prompted, click "Reopen in Container" or use `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"
4. VS Code will build the container and install dependencies automatically

**Using with GitHub Codespaces:**
1. Navigate to the repository on GitHub
2. Click the green "Code" button → "Codespaces" tab → "Create codespace on main"
3. The environment will be ready with all dependencies installed

**Manual setup in any devcontainer-compatible environment:**
```bash
# The container will automatically run these commands:
npm install                # Install dependencies
npm run build             # Build the project
npm test                  # Verify everything works
```

Once inside the devcontainer, you can use all the standard development commands like `npm run example`, `npm test`, and `npm run build` as documented below.

### Building

```bash
npm run build          # Compile TypeScript
npm run build:clean    # Clean build and rebuild
```

### Testing

The project uses Node.js built-in test runner with comprehensive test coverage:

```bash
npm test               # Build and run all tests
```

Test coverage includes:
- Locale detection and matching algorithms
- Fallback behavior for unsupported locales
- Nested phrase structure support
- Malformed `Accept-Language` header handling
- Plugin registration and decorator behavior

### Code Style

The project uses [neostandard](https://github.com/neostandard/neostandard) ESLint configuration:

```bash
npx eslint .           # Check code style
npx eslint . --fix     # Auto-fix style issues
```

### Project Structure

```
├── src/
│   ├── plugin.ts      # Main plugin implementation
│   └── util.ts        # Locale matching utilities
├── test/              # Test files
├── example/           # Working example application
└── dist/              # Compiled output
```

## Continuous Integration

The project includes automated CI/CD with:

- **GitHub Actions**: Automated testing on Node.js 20.x and 22.x
- **Dependabot**: Daily dependency updates
- **Code Quality**: Automated linting and type checking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass and code follows style guidelines
5. Submit a pull request

## License

Licensed under [MIT](./LICENSE).
