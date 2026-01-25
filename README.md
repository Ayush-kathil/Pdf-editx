# Secure PDF & Image Suite

A privacy-first document utility suite engineered with **Next.js 14**,
**TypeScript**, and **WebAssembly**.

This application processes sensitive files (PDFs, Images) entirely within the
browser client. By leveraging the HTML5 Canvas API and `pdf-lib`, it eliminates
the need for server-side processing, ensuring **Zero Knowledge** architecture
where user data never leaves the device.

## 🛡️ Features

### 1. PDF Tools

- **Unlock Content**: Remove password restrictions derived from standard
  Aadhaar/Bank formats or generic passwords.
- **Compress PDF**: Optimize PDF file size efficiently while maintaining
  readability.

### 2. Image Tools

- **Image Compressor**: Intelligent compression for JPG, PNG, and WebP.
  - **Target Size Mode**: Specify a max size (e.g., "100KB") and the algorithm
    auto-adjusts quality.
  - **Quality Mode**: Manually fine-tune compression levels.

### 3. Security & Privacy

- **Zero Knowledge**: Uses WebAssembly and HTML5 Canvas to process files
  client-side.
- **Local Encryption**: Strict Content Security Policy (CSP) prevents external
  data exfiltration.
- **No Analytics**: No tracking scripts or cookies.

### 4. Modern UI/UX

- **Apple-Style Design**: Minimalist, clean aesthetics with smooth spring
  animations.
- **Dark/Light Mode**: Fully responsive theme system.
- **Mobile Optimized**: Works perfectly on phones, tablets, and desktops.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ayush-kathil/Pdf-editx.git
   cd Pdf-editx
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Processing**: `pdf-lib`
- **Image Processing**: Native Canvas API

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
