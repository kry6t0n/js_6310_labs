# UI Library

Reusable UI components library for the Network Topology Visualizer project.

## Components

### Button

Customizable button component with multiple variants.

**Props:**
- `children` - Button text
- `onClick` - Click handler
- `variant` - 'primary' | 'secondary' | 'text' (default: 'primary')
- `disabled` - Disable button
- `className` - Additional CSS classes

**Usage:**
```tsx
import { Button } from '@ui-library';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

### Modal

Modal dialog component for displaying content in a modal window.

**Props:**
- `isOpen` - Control modal visibility
- `onClose` - Close handler
- `title` - Modal title (optional)
- `children` - Modal content

**Usage:**
```tsx
import { Modal } from '@ui-library';

<Modal isOpen={isOpen} onClose={handleClose} title="My Modal">
  <p>Modal content</p>
</Modal>
```

### FileUpload

File upload component with customizable accept types.

**Props:**
- `onFileSelect` - File selection handler
- `accept` - File type filter (default: '*/*')
- `label` - Button label
- `disabled` - Disable upload

**Usage:**
```tsx
import { FileUpload } from '@ui-library';

<FileUpload 
  accept=".json" 
  onFileSelect={(file) => console.log(file)}
  label="Upload File"
/>
```

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Development

The library is built with TypeScript and uses Vite for bundling.

## License

MIT
