/**
 * Email Templates for HireSpark Notifications
 * Classic and professional design
 */

// Template for Job Approval Notification
export const jobApprovedEmailTemplate = (hrName, jobTitle, jobLocation, jobType, postedDate) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Job Post Approved</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7fa;
          padding: 20px;
          line-height: 1.6;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 40px 30px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .header p {
          font-size: 14px;
          opacity: 0.95;
          margin-top: 5px;
        }
        .success-badge {
          display: inline-block;
          background-color: rgba(255, 255, 255, 0.2);
          padding: 8px 20px;
          border-radius: 20px;
          margin-top: 15px;
          font-size: 13px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .message {
          font-size: 15px;
          color: #4a5568;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .info-card {
          background-color: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 25px 0;
          border-radius: 6px;
        }
        .info-card h3 {
          font-size: 16px;
          color: #2d3748;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .info-row {
          display: flex;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .info-label {
          font-weight: 600;
          color: #4a5568;
          min-width: 140px;
        }
        .info-value {
          color: #2d3748;
          flex: 1;
        }
        .job-title-highlight {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 18px;
        }
        .status-badge {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
        .action-section {
          background-color: #edf2f7;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          text-align: center;
        }
        .action-section p {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 15px;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          transition: transform 0.2s;
        }
        .btn:hover {
          transform: translateY(-2px);
        }
        .footer {
          background-color: #2d3748;
          padding: 30px;
          text-align: center;
          color: #a0aec0;
        }
        .footer p {
          font-size: 13px;
          margin-bottom: 8px;
        }
        .footer .brand {
          color: #10b981;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 10px;
          display: block;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e2e8f0, transparent);
          margin: 25px 0;
        }
        .highlight-box {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 2px solid #10b981;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .highlight-box h2 {
          color: #059669;
          font-size: 20px;
          margin-bottom: 10px;
        }
        @media only screen and (max-width: 600px) {
          .email-container {
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 25px 20px;
          }
          .info-row {
            flex-direction: column;
          }
          .info-label {
            margin-bottom: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>✅ Job Post Approved!</h1>
          <p>HireSpark - Recruitment Management System</p>
          <div class="success-badge">🎉 Congratulations</div>
        </div>

        <!-- Content -->
        <div class="content">
          <p class="greeting">Dear ${hrName},</p>
          
          <p class="message">
            Great news! Your job posting has been reviewed and <strong>approved</strong> by our admin team. 
            Your job is now live and visible to potential candidates.
          </p>

          <!-- Job Information -->
          <div class="highlight-box">
            <h2 class="job-title-highlight">${jobTitle}</h2>
            <span class="status-badge">✓ APPROVED & LIVE</span>
          </div>

          <div class="info-card">
            <h3>📋 Job Details</h3>
            <div class="info-row">
              <span class="info-label">Position:</span>
              <span class="info-value">${jobTitle}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Location:</span>
              <span class="info-value">${jobLocation || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Job Type:</span>
              <span class="info-value">${jobType || 'Full-time'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Posted Date:</span>
              <span class="info-value">${postedDate}</span>
            </div>
          </div>

          <!-- Action Section -->
          <div class="action-section">
            <p><strong>What's Next?</strong></p>
            <p>You can now start receiving applications and manage candidates through your dashboard.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/hr/dashboard" class="btn">
              View Dashboard →
            </a>
          </div>

          <div class="divider"></div>

          <p class="message" style="margin-top: 25px; font-size: 14px; color: #718096;">
            <strong>💡 Tips:</strong>
          </p>
          <ul style="color: #4a5568; font-size: 14px; margin-left: 20px; line-height: 1.8;">
            <li>Monitor applications regularly through your dashboard</li>
            <li>Respond to candidates promptly to maintain engagement</li>
            <li>Update job status when positions are filled</li>
          </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
          <span class="brand">HireSpark</span>
          <p>Streamlining your recruitment process</p>
          <p style="margin-top: 15px; font-size: 12px;">
            This is an automated notification. Please do not reply to this email.
          </p>
          <p style="font-size: 12px; margin-top: 5px;">
            © ${new Date().getFullYear()} HireSpark. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for Candidate Addition Notification
export const candidateAddedEmailTemplate = (hrName, candidateName, jobTitle, candidateEmail, candidatePhone) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Candidate Added</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7fa;
          padding: 20px;
          line-height: 1.6;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .header p {
          font-size: 14px;
          opacity: 0.95;
          margin-top: 5px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .message {
          font-size: 15px;
          color: #4a5568;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .info-card {
          background-color: #f7fafc;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 25px 0;
          border-radius: 6px;
        }
        .info-card h3 {
          font-size: 16px;
          color: #2d3748;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .info-row {
          display: flex;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .info-label {
          font-weight: 600;
          color: #4a5568;
          min-width: 140px;
        }
        .info-value {
          color: #2d3748;
          flex: 1;
        }
        .job-title-highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 16px;
        }
        .action-section {
          background-color: #edf2f7;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          text-align: center;
        }
        .action-section p {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 15px;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          transition: transform 0.2s;
        }
        .btn:hover {
          transform: translateY(-2px);
        }
        .footer {
          background-color: #2d3748;
          padding: 30px;
          text-align: center;
          color: #a0aec0;
        }
        .footer p {
          font-size: 13px;
          margin-bottom: 8px;
        }
        .footer .brand {
          color: #667eea;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 10px;
          display: block;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e2e8f0, transparent);
          margin: 25px 0;
        }
        @media only screen and (max-width: 600px) {
          .email-container {
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 25px 20px;
          }
          .info-row {
            flex-direction: column;
          }
          .info-label {
            margin-bottom: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>🎯 New Candidate Added</h1>
          <p>HireSpark - Recruitment Management System</p>
        </div>

        <!-- Content -->
        <div class="content">
          <p class="greeting">Dear ${hrName},</p>
          
          <p class="message">
            We're pleased to inform you that a new candidate has been added to your job posting by the admin team. 
            Please review the candidate details below and take necessary action.
          </p>

          <!-- Job Information -->
          <div class="info-card">
            <h3>📋 Job Position</h3>
            <div class="info-row">
              <span class="info-label">Position:</span>
              <span class="info-value job-title-highlight">${jobTitle}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Candidate Information -->
          <div class="info-card">
            <h3>👤 Candidate Details</h3>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${candidateName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${candidateEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${candidatePhone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value" style="color: #f59e0b; font-weight: 600;">⏳ Pending Review</span>
            </div>
          </div>

          <!-- Action Section -->
          <div class="action-section">
            <p>Please log in to your dashboard to review the candidate's resume and update their status.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/hr/dashboard" class="btn">
              View Dashboard →
            </a>
          </div>

          <p class="message" style="margin-top: 25px; font-size: 14px; color: #718096;">
            <strong>Note:</strong> This candidate has been added by the admin team. 
            Please review their profile and provide feedback at your earliest convenience.
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <span class="brand">HireSpark</span>
          <p>Streamlining your recruitment process</p>
          <p style="margin-top: 15px; font-size: 12px;">
            This is an automated notification. Please do not reply to this email.
          </p>
          <p style="font-size: 12px; margin-top: 5px;">
            © ${new Date().getFullYear()} HireSpark. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for Candidate Shortlisted Notification
export const candidateShortlistedEmailTemplate = (candidateName, jobTitle, companyName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Congratulations! You've been Shortlisted</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; padding: 20px; line-height: 1.6; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center; color: #ffffff; }
        .header h1 { font-size: 26px; font-weight: 600; margin-bottom: 8px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 500; }
        .message { font-size: 15px; color: #475569; margin-bottom: 30px; }
        .highlight-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 6px; }
        .highlight-box h3 { color: #1e293b; font-size: 16px; margin-bottom: 5px; }
        .highlight-box p { color: #3b82f6; font-weight: 600; font-size: 18px; }
        .footer { background-color: #1e293b; padding: 30px; text-align: center; color: #94a3b8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎉 You're Shortlisted!</h1>
          <p>HireSpark Recruitment Update</p>
        </div>
        <div class="content">
          <p class="greeting">Dear ${candidateName},</p>
          <p class="message">
            We are excited to inform you that your application for the position of <strong>${jobTitle}</strong> has been <strong>shortlisted</strong>!
          </p>
          <p class="message">
            Our team was impressed with your profile and qualifications. We are currently reviewing next steps and will be in touch shortly regarding the interview process.
          </p>
          
          <div class="highlight-box">
            <h3>Position</h3>
            <p>${jobTitle}</p>
            ${companyName ? `<p style="font-size: 14px; color: #64748b; margin-top: 5px;">at ${companyName}</p>` : ''}
          </div>

          <p class="message">
            Please keep an eye on your email for further updates.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} HireSpark. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
