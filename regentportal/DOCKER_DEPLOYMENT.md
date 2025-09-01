# 🐳 Regent Portal - Docker Deployment Guide

## 📋 Prerequisites
- Docker installed locally
- Northflank account
- GitHub repository with your code

## 🔧 **Local Testing with Docker**

### **Step 1: Test Locally**
```bash
# Build and run both services
docker-compose up --build

# Or build individually
docker build -f Dockerfile.backend -t regent-portal-backend .
docker build -f Dockerfile.frontend -t regent-portal-frontend .
```

### **Step 2: Test Services**
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:80

## 🚀 **Northflank Docker Deployment**

### **Backend Service Setup:**
1. **Create new service** → "Web Service"
2. **Connect GitHub** repository
3. **Build Configuration**:
   - **Build Context**: `/` (root)
   - **Dockerfile Path**: `Dockerfile.backend`
   - **Port**: `3000`

4. **Environment Variables**:
   ```bash
   MONGO_URI=your_mongodb_connection_string
   NODE_ENV=production
   PORT=3000
   ```

### **Frontend Service Setup:**
1. **Create new service** → "Web Service"
2. **Connect GitHub** repository
3. **Build Configuration**:
   - **Build Context**: `/` (root)
   - **Dockerfile Path**: `Dockerfile.frontend`
   - **Port**: `80`

4. **Environment Variables**:
   ```bash
   REACT_APP_API_URL=https://your-backend-service-url
   NODE_ENV=production
   ```

## 📁 **Docker Files Created**

### **Frontend Service** (`Dockerfile.frontend`)
- Multi-stage build (Node.js → Nginx)
- Builds React app in Node.js container
- Serves static files with Nginx
- Optimized for production

### **Backend Service** (`Dockerfile.backend`)
- Single-stage Node.js build
- Installs production dependencies only
- Runs server.js directly
- Includes assets folder

### **Local Testing** (`docker-compose.yml`)
- Runs both services locally
- Maps ports correctly
- Sets up environment variables
- Easy testing before deployment

## 🎯 **Benefits of Docker Approach**

### **Consistency:**
- ✅ **Same environment** everywhere
- ✅ **No buildpack issues**
- ✅ **Predictable builds**

### **Debugging:**
- ✅ **Test locally first**
- ✅ **Clear build process**
- ✅ **Easy to troubleshoot**

### **Control:**
- ✅ **Explicit dependencies**
- ✅ **Custom configurations**
- ✅ **Version control**

## 🛠️ **Troubleshooting**

### **Build Issues:**
```bash
# Test locally first
docker build -f Dockerfile.frontend -t test-frontend .
docker build -f Dockerfile.backend -t test-backend .

# Check logs
docker logs <container-id>
```

### **Runtime Issues:**
```bash
# Check container status
docker ps

# Access container shell
docker exec -it <container-id> sh
```

## 📊 **Docker vs Buildpacks**

### **Docker Advantages:**
- ✅ **Consistent builds**
- ✅ **Local testing**
- ✅ **Clear process**
- ✅ **Easy debugging**

### **Buildpacks Disadvantages:**
- ❌ **Platform-specific issues**
- ❌ **Cache problems**
- ❌ **Hard to debug**
- ❌ **Inconsistent behavior**

## 🚀 **Deployment Steps**

1. **Test locally** with docker-compose
2. **Deploy backend** to Northflank
3. **Get backend URL**
4. **Update frontend** environment variable
5. **Deploy frontend** to Northflank
6. **Test integration**

---

**🐳 Docker deployment will be much more reliable than buildpacks!** 