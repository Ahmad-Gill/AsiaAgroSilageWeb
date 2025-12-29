import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',  // Allow the app to be accessible on all IP addresses
    port: 8080,        // You can use any port you prefer
    allowedHosts: [
      'app-asia-agro-silage-dev0suc-fe-akc7ascghmgwc8ay.centralus-01.azurewebsites.net'  // Add your Azure host here
    ],
  },
})
