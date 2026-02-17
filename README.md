<div align="center">
  <a href="https://pdfeditx.vercel.app">
    <img src="https://readme-typing-svg.herokuapp.com?font=Product+Sans&weight=700&size=50&pause=1000&color=white&center=true&vCenter=true&width=600&lines=Secure+PDF+%26+Image+Suite;Privacy.+Speed.+Control." alt="Typing SVG" />
  </a>

<h3 align="center">Next-Gen Document Utility Engineered with Next.js 14</h3>

<p align="center">
    A <b>Zero-Knowledge</b> architecture where your sensitive documents never leave your browser.<br>
    Powered by <b>WebAssembly</b> and <b>Client-Side Processing</b>.
  </p>

<div align="center">
    <a href="https://pdfeditx.vercel.app">
      <img src="https://img.shields.io/badge/Live_Demo-Launch_App-0F9D58?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
    <a href="https://github.com/Ayush-kathil/Pdf-editx">
      <img src="https://img.shields.io/badge/Repo-View_Code-202124?style=for-the-badge&logo=github&logoColor=white" alt="Repo" />
    </a>
  </div>
</div>

<br/>

## ⚡ The Engineering Philosophy

**PDFEditX** is a privacy-first utility suite designed to solve a specific
problem: _How do we manipulate sensitive documents (like Bank Statements or
Aadhaar Cards) without trusting a third-party server?_

- **Zero Latency:** By leveraging the **HTML5 Canvas API** and **`pdf-lib`**,
  operations happen instantly on your device.
- **Zero Knowledge:** No file uploads. No server-side storage. Strict **Content
  Security Policy (CSP)** prevents data exfiltration.
- **Modern Core:** Built on the bleeding edge with **Next.js 14 (App Router)**
  and **TypeScript**.

---

## 🛠️ The Toolkit

### 📄 Core PDF Operations

| Feature              | Description                                                                                                       | Tech                |
| :------------------- | :---------------------------------------------------------------------------------------------------------------- | :------------------ |
| **🔀 Merge PDFs**    | Combine multiple documents into a single cohesive file with drag-and-drop reordering.                             | `pdf-lib`           |
| **✂️ Split PDFs**    | Extract specific pages or split a large document into individual files instantly.                                 | `ArrayBuffer`       |
| **🔓 Unlock PDF**    | Remove password restrictions derived from standard formats (e.g., Aadhaar, Bank Statements) or generic passwords. | `Client Encryption` |
| **📉 Compress PDF**  | Smart optimization to reduce file size while maintaining text clarity and readability.                            | `Compression Alg`   |
| **🔄 Rotate PDF**    | Rotate individual pages or the entire document permanently using client-side processing.                          | `pdf-lib`           |
| **📑 Organize PDF**  | Reorder, delete, or rotate pages within a PDF document with an intuitive drag-and-drop interface.                 | `pdf-lib`           |
| **💧 Watermark PDF** | Add text or image watermarks to your PDF documents for security and branding.                                     | `pdf-lib`           |
| **🖼️ PDF to JPG**    | Convert PDF pages into high-quality JPG images instantly.                                                         | `pdf.js`            |

### 🖼️ Image & Video Intelligence

| Feature               | Description                                                                                                                       | Mode            |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :-------------- |
| **🖼️ Image to PDF**   | Convert JPG, PNG, or WebP images into a standardized PDF document.                                                                | `Canvas API`    |
| **⚡ Smart Compress** | **Target Size Mode:** Specify "100KB" and the AI logic auto-adjusts quality to match.<br>**Quality Mode:** Manual slider control. | `Blob Logic`    |
| **🔄 HEIC to JPG**    | Convert Apple's HEIC format to widely compatible JPG format.                                                                      | `heic2any`      |
| **🎥 MOV to MP4**     | Convert MOV video files to MP4 format directly in the browser using FFmpeg.                                                       | `FFmpeg (WASM)` |

---

## 💻 Tech Stack

| **Framework & Core**                                                                                             | **Processing & Logic**                                                                                              | **UI & UX**                                                                                                    |
| :--------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------- |
| ![Next.js](https://img.shields.io/badge/-Next.js_14-000000?style=flat-square&logo=next.js&logoColor=white)       | ![WebAssembly](https://img.shields.io/badge/-WebAssembly-654FF0?style=flat-square&logo=webassembly&logoColor=white) | ![Tailwind](https://img.shields.io/badge/-Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | ![PDF-Lib](https://img.shields.io/badge/-PDF_Lib-FF6F00?style=flat-square&logo=javascript&logoColor=white)          | ![Framer](https://img.shields.io/badge/-Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)    |

---

## 🚀 Getting Started

Clone the repository and run the engine locally in 3 steps.

```bash
# 1. Clone the repository
git clone [https://github.com/Ayush-kathil/Pdf-editx.git](https://github.com/Ayush-kathil/Pdf-editx.git)
cd Pdf-editx

# 2. Install dependencies
npm install

# 3. Ignite the dev server
npm run dev
```
