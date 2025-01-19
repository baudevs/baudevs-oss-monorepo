# YOLO Landing Page

A modern, interactive landing page for the YOLO project management tool, built with Next.js 15, Three.js, and Framer Motion.

## Features

- 🎨 Modern, playful design with dark mode
- 📱 Fully responsive (mobile-first)
- ✨ Interactive 3D visualizations with Three.js
- 🎭 Smooth animations with Framer Motion
- 🚀 Optimized performance
- 🔒 Security headers configured
- 🐳 Docker support for easy deployment

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Three.js
- Framer Motion
- Docker

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm package manager

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/yolo-landing.git
   cd yolo-landing
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
```

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t yolo-landing .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 yolo-landing
   ```

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   ├── 3d/          # Three.js components
│   │   └── sections/    # Page sections
│   ├── lib/            # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── styles/         # Global styles
├── public/            # Static assets
└── docker/           # Docker configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
