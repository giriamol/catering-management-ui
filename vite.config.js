// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//    build: {
//     chunkSizeWarningLimit: 1000,
//   },
// })


import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5181',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:5181',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})


// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'

// export default defineConfig({
//   plugins: [react()],

//   // Development server proxy
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:7174',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },

//   // Production preview server proxy for local testing
//   preview: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:7174',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },

//   build: {
//     chunkSizeWarningLimit: 1000,
//   },
// })
