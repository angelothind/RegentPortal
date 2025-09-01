# Docker Deployment Guide for Northflank

## 🚀 **Deploy to Northflank (Multi-Service Setup)**

### **Step 1: Create Backend Service**

1. **Go to Northflank Dashboard**
   - Navigate to your project
   - Click "Add Service" → "Docker"

2. **Configure Backend Service**
   - **Name**: `regentportal-backend`
   - **Repository**: Your GitHub repo
   - **Branch**: `main` (or your deployment branch)
   - **Build Context**: `/` (root directory)
   - **Dockerfile**: `Dockerfile.backend`

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000
   MONGO_URI=mongodb+srv://angelothind:Ch1angmai%21@regentportal.77lx7vr.mongodb.net/regentportal?retryWrites=true&w=majority&appName=regentportal
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Port Configuration**
   - **Port**: `3000`
   - **Protocol**: `HTTP`
   - **Public**: `false` (internal service)

5. **Resources**
   - **CPU**: 0.5 cores
   - **Memory**: 512MB

### **Step 2: Create Frontend Service**

1. **Add Another Service**
   - Click "Add Service" → "Docker"

2. **Configure Frontend Service**
   - **Name**: `regentportal-frontend`
   - **Repository**: Same GitHub repo
   - **Branch**: `main` (or your deployment branch)
   - **Build Context**: `/` (root directory)
   - **Dockerfile**: `Dockerfile.frontend`

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://regentportal-backend--your-project-id.code.run
   ```
   **⚠️ Important**: Replace `your-project-id` with your actual Northflank project ID

4. **Port Configuration**
   - **Port**: `80`
   - **Protocol**: `HTTP`
   - **Public**: `true` (publicly accessible)

5. **Resources**
   - **CPU**: 0.25 cores
   - **Memory**: 256MB

### **Step 3: Deploy Services**

1. **Deploy Backend First**
   - Deploy the backend service
   - Wait for it to be fully running
   - Copy the backend URL

2. **Update Frontend API URL**
   - Go to frontend service settings
   - Update `REACT_APP_API_URL` with the actual backend URL
   - Redeploy frontend

### **Step 4: Verify Deployment**

1. **Check Backend**
   - Visit: `https://regentportal-backend--your-project-id.code.run`
   - Should show API is running

2. **Check Frontend**
   - Visit: `https://regentportal-frontend--your-project-id.code.run`
   - Should load your React app

## 🔧 **Alternative: Using YAML Files**

You can also use the provided YAML files:

1. **Backend**: Use `northflank-backend.yaml`
2. **Frontend**: Use `northflank-frontend.yaml`

**⚠️ Remember to update the `REACT_APP_API_URL` in the frontend YAML with your actual backend URL!**

## 🎯 **Key Points**

- **Backend**: Internal service (not publicly accessible)
- **Frontend**: Public service (accessible to users)
- **Communication**: Frontend calls backend via internal Northflank network
- **Environment Variables**: Set securely in Northflank dashboard
- **Deploy Order**: Backend first, then frontend

## 🚀 **Your App Will Be Available At**

- **Frontend**: `https://regentportal-frontend--your-project-id.code.run`
- **Backend**: `https://regentportal-backend--your-project-id.code.run` (internal)

---

## 📝 **Local Testing (Optional)**

To test the production setup locally:

```bash
# Build and run with production settings
docker-compose up --build

# Access your app
# Frontend: http://localhost:8080
# Backend: http://localhost:3001
``` 