import { Request, Response, NextFunction } from "express";

// Terms and Conditions
export const getTermsAndConditions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        title: "Terms and Conditions",
        lastUpdated: new Date().toISOString(),
        content: `
# Terms and Conditions

**Last Updated: ${new Date().toLocaleDateString()}**

## 1. Acceptance of Terms

By accessing and using ConnectX, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License

Permission is granted to temporarily use ConnectX for personal, non-commercial transitory viewing only.

## 3. Premium Subscriptions

- Premium subscriptions are billed monthly or annually as selected
- Subscriptions automatically renew unless cancelled
- Cancellation can be done at any time through your account settings
- Refunds are processed according to our Cancellation and Refunds Policy

## 4. User Accounts

- You are responsible for maintaining the confidentiality of your account
- You agree to notify us immediately of any unauthorized use
- We reserve the right to suspend or terminate accounts that violate these terms

## 5. Content

- Users retain ownership of content they post
- By posting, you grant ConnectX a license to display and distribute your content
- Prohibited content includes illegal, harmful, or offensive material

## 6. Limitation of Liability

ConnectX shall not be liable for any indirect, incidental, special, or consequential damages.

## 7. Changes to Terms

We reserve the right to modify these terms at any time. Continued use constitutes acceptance of changes.

## Contact

For questions about these Terms, please contact us at support@connectx.com
        `.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Privacy Policy
export const getPrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        title: "Privacy Policy",
        lastUpdated: new Date().toISOString(),
        content: `
# Privacy Policy

**Last Updated: ${new Date().toLocaleDateString()}**

## 1. Information We Collect

We collect information that you provide directly to us, including:
- Name, email address, and phone number
- Profile information and preferences
- Payment information (processed securely through Razorpay)
- Content you post, including posts, comments, and messages

## 2. How We Use Your Information

We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices and support messages
- Respond to your comments and questions
- Monitor and analyze trends and usage

## 3. Information Sharing

We do not sell your personal information. We may share information:
- With service providers who assist in operating our platform
- When required by law or to protect rights and safety
- In connection with a business transfer or merger

## 4. Payment Information

Payment information is processed securely through Razorpay. We do not store your full payment card details on our servers.

## 5. Data Security

We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.

## 6. Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Opt-out of certain communications

## 7. Cookies

We use cookies to enhance your experience, analyze usage, and assist with marketing efforts.

## 8. Children's Privacy

Our service is not intended for users under 13 years of age. We do not knowingly collect information from children.

## 9. Changes to Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of changes by posting the new policy on this page.

## Contact

For privacy concerns, contact us at privacy@connectx.com
        `.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Shipping Policy
export const getShippingPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        title: "Shipping Policy",
        lastUpdated: new Date().toISOString(),
        content: `
# Shipping Policy

**Last Updated: ${new Date().toLocaleDateString()}**

## Digital Services

ConnectX is a digital platform providing online services including:
- Social networking features
- Premium subscription services
- Digital rewards and coins
- Event management and club features

## Delivery Method

Since all our services are digital:
- **Premium Subscriptions**: Activated immediately upon successful payment
- **Digital Coins**: Credited to your account instantly after payment verification
- **Rewards**: Available immediately upon redemption
- **Access to Features**: Granted instantly upon subscription activation

## Processing Time

- **Premium Subscriptions**: Instant activation after payment confirmation
- **Coin Purchases**: Immediate credit after payment verification (typically within minutes)
- **Account Upgrades**: Applied immediately upon subscription activation

## No Physical Shipping

ConnectX does not ship physical products. All services are delivered digitally through our platform.

## International Access

Our digital services are available to users worldwide, subject to local regulations and payment method availability.

## Delivery Confirmation

You will receive email confirmation for:
- Successful subscription activation
- Coin purchase completion
- Payment receipts

## Technical Issues

If you experience any issues accessing your purchased services:
1. Check your account status in the app
2. Verify payment was successful
3. Contact support@connectx.com with your order details

## Contact

For shipping-related inquiries, contact us at support@connectx.com
        `.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Contact Us
export const getContactUs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        title: "Contact Us",
        content: `
# Contact Us

## Get in Touch

We're here to help! Reach out to us through any of the following channels:

## Email Support

- **General Inquiries**: support@connectx.com
- **Premium Subscription Support**: premium@connectx.com
- **Payment & Billing**: billing@connectx.com
- **Privacy Concerns**: privacy@connectx.com
- **Technical Support**: tech@connectx.com

## Response Time

- **General Inquiries**: Within 24-48 hours
- **Premium/Billing Issues**: Within 12-24 hours
- **Technical Support**: Within 24 hours
- **Urgent Matters**: Within 6 hours

## Business Hours

Our support team is available:
- **Monday - Friday**: 9:00 AM - 6:00 PM IST
- **Saturday**: 10:00 AM - 4:00 PM IST
- **Sunday**: Closed

## Office Address

ConnectX Technologies
[Your Business Address]
[City, State, PIN Code]
India

## Phone Support

For urgent matters, please email us with "URGENT" in the subject line, and we'll prioritize your request.

## Social Media

- **Twitter**: @ConnectXApp
- **Instagram**: @ConnectXApp
- **LinkedIn**: ConnectX Technologies

## FAQ

Before contacting us, check our FAQ section for quick answers to common questions.

## Report Issues

To report bugs or technical issues:
1. Include your account email
2. Describe the issue in detail
3. Attach screenshots if applicable
4. Mention your device and app version

We appreciate your feedback and are committed to providing excellent customer service.
        `.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancellation and Refunds
export const getCancellationAndRefunds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        title: "Cancellation and Refunds Policy",
        lastUpdated: new Date().toISOString(),
        content: `
# Cancellation and Refunds Policy

**Last Updated: ${new Date().toLocaleDateString()}**

## 1. Premium Subscription Cancellation

### How to Cancel

You can cancel your premium subscription at any time:
- Through your account settings in the app
- By contacting support@connectx.com
- Through the subscription management page

### Cancellation Effect

- **Immediate Cancellation**: Your subscription will not renew after the current billing period
- **Access Duration**: You will retain premium access until the end of your current billing period
- **No Immediate Termination**: Cancellation does not immediately revoke access

### Refund Eligibility

- **Within 7 Days**: Full refund if cancelled within 7 days of initial purchase
- **After 7 Days**: No refund, but access continues until period end
- **Annual Plans**: Pro-rated refunds available within 30 days of purchase

## 2. Coin Purchase Refunds

### Refund Policy

- **Unused Coins**: Refunds not available for purchased coins
- **Technical Issues**: Full refund if coins not credited due to technical errors
- **Duplicate Payments**: Full refund for duplicate transactions
- **Processing Time**: 5-7 business days for refund processing

## 3. Refund Process

### Requesting a Refund

1. Contact billing@connectx.com with:
   - Your account email
   - Transaction ID or order number
   - Reason for refund request
   - Proof of payment (if applicable)

2. Our team will review within 2-3 business days

3. Approved refunds will be processed to the original payment method

### Refund Timeline

- **Review Period**: 2-3 business days
- **Processing Time**: 5-7 business days
- **Credit to Account**: 7-14 business days total

## 4. Non-Refundable Items

The following are not eligible for refunds:
- Coins that have been used or gifted
- Premium subscriptions cancelled after 7 days (initial purchase) or 30 days (annual)
- Rewards that have been redeemed
- Services already consumed

## 5. Chargebacks

If you initiate a chargeback:
- Your account may be suspended pending investigation
- We will work with you to resolve the issue
- Unauthorized chargebacks may result in account termination

## 6. Disputes

For payment disputes:
- Contact billing@connectx.com immediately
- Provide transaction details
- We will investigate and respond within 48 hours

## 7. Special Circumstances

### Technical Errors

If you experience technical issues preventing service access:
- Contact tech@connectx.com
- We will investigate and provide appropriate resolution
- May include service extension or refund

### Fraudulent Transactions

If you notice unauthorized charges:
- Contact billing@connectx.com immediately
- We will investigate and process refunds if confirmed
- May require additional verification

## 8. Contact for Refunds

**Email**: billing@connectx.com
**Subject**: Refund Request - [Your Transaction ID]

## 9. Changes to Policy

We reserve the right to modify this policy. Changes will be communicated via email and posted on this page.

## 10. Governing Law

Refund requests are subject to Indian law and Razorpay's terms of service.
        `.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
};

