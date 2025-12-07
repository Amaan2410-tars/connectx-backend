# Razorpay Legal Pages - Implementation Guide

## ✅ Mandatory Pages Created

All required legal pages for Razorpay verification have been implemented as API endpoints.

## 📍 Available Endpoints

All endpoints are **PUBLIC** (no authentication required):

### 1. Terms and Conditions
**GET** `/api/legal/terms`

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Terms and Conditions",
    "lastUpdated": "2024-12-05T...",
    "content": "# Terms and Conditions\n\n..."
  }
}
```

### 2. Privacy Policy
**GET** `/api/legal/privacy`

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Privacy Policy",
    "lastUpdated": "2024-12-05T...",
    "content": "# Privacy Policy\n\n..."
  }
}
```

### 3. Shipping Policy
**GET** `/api/legal/shipping`

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Shipping Policy",
    "lastUpdated": "2024-12-05T...",
    "content": "# Shipping Policy\n\n..."
  }
}
```

### 4. Contact Us
**GET** `/api/legal/contact`

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Contact Us",
    "content": "# Contact Us\n\n..."
  }
}
```

### 5. Cancellation and Refunds
**GET** `/api/legal/refunds`

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Cancellation and Refunds Policy",
    "lastUpdated": "2024-12-05T...",
    "content": "# Cancellation and Refunds Policy\n\n..."
  }
}
```

## 🌐 Frontend Integration

### Option 1: Direct API Calls
Your frontend can fetch these pages directly:

```typescript
// Example: Fetch Terms and Conditions
const response = await fetch('http://localhost:4000/api/legal/terms');
const data = await response.json();
// Display data.content in your UI
```

### Option 2: Create Frontend Pages
Create static pages in your frontend that fetch and display the content:

```typescript
// pages/Terms.tsx
import { useEffect, useState } from 'react';

export const TermsPage = () => {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    fetch('/api/legal/terms')
      .then(res => res.json())
      .then(data => setContent(data.data.content));
  }, []);
  
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};
```

### Option 3: Static Routes
For Razorpay verification, you can create static HTML pages:

- `/terms` → Terms and Conditions
- `/privacy` → Privacy Policy
- `/shipping` → Shipping Policy
- `/contact` → Contact Us
- `/refunds` → Cancellation and Refunds

## 📝 Content Customization

All content is stored in:
- `backend/src/controllers/legal.controller.ts`

You can customize:
- Email addresses (currently using placeholder emails)
- Business address
- Phone numbers
- Social media links
- Specific refund policies
- Terms and conditions details

## 🔗 Razorpay Verification URLs

When submitting for Razorpay verification, provide these URLs:

1. **Terms and Conditions**: `https://yourdomain.com/api/legal/terms`
2. **Privacy Policy**: `https://yourdomain.com/api/legal/privacy`
3. **Shipping Policy**: `https://yourdomain.com/api/legal/shipping`
4. **Contact Us**: `https://yourdomain.com/api/legal/contact`
5. **Cancellation & Refunds**: `https://yourdomain.com/api/legal/refunds`

## ⚠️ Important Notes

1. **Update Contact Information**: Replace placeholder emails and addresses with your actual business details
2. **Customize Content**: Review and customize all policies to match your business model
3. **Legal Review**: Have a lawyer review the terms before going live
4. **Accessibility**: Ensure these pages are easily accessible from your website footer
5. **HTTPS Required**: Razorpay requires HTTPS in production

## 🚀 Next Steps

1. **Customize Content**: Update all placeholder information in `legal.controller.ts`
2. **Create Frontend Pages**: Build frontend pages that display this content
3. **Add Footer Links**: Add links to these pages in your website footer
4. **Test URLs**: Verify all URLs are accessible
5. **Submit to Razorpay**: Use these URLs in your Razorpay verification form

## 📧 Email Placeholders to Update

Replace these in `legal.controller.ts`:
- `support@connectx.com` → Your support email
- `premium@connectx.com` → Your premium support email
- `billing@connectx.com` → Your billing email
- `privacy@connectx.com` → Your privacy email
- `tech@connectx.com` → Your technical support email

## ✅ Verification Checklist

- [x] Terms and Conditions endpoint created
- [x] Privacy Policy endpoint created
- [x] Shipping Policy endpoint created
- [x] Contact Us endpoint created
- [x] Cancellation and Refunds endpoint created
- [ ] Content customized with actual business details
- [ ] Frontend pages created to display content
- [ ] Footer links added to website
- [ ] URLs tested and accessible
- [ ] HTTPS configured for production
- [ ] Legal review completed



