export function paymentSuccessTemplate({
  username = "User",
  courseTitle,
  courseDescription,
  coursePrice,
  currency,
  method,
  transactionId,
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Successful</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 650px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #34a853;
            padding-bottom: 15px;
          }
          .header h1 {
            color: #34a853;
          }
          .content {
            margin-top: 20px;
          }
          .content p {
            font-size: 16px;
            color: #555;
            line-height: 1.5;
          }
          .details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
          }
          .details h3 {
            color: #333;
            margin-bottom: 8px;
          }
          .details p {
            margin: 6px 0;
            font-size: 15px;
            color: #444;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #1a73e8;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Successful!</h1>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            <p>Thank you for your purchase! Your payment has been successfully processed.</p>

            <div class="details">
              <h3>Course Details</h3>
              <p><strong>Title:</strong> ${courseTitle}</p>
              <p><strong>Description:</strong> ${courseDescription}</p>
              <p><strong>Price:</strong> ${coursePrice} ${currency}</p>
            </div>

            <div class="details">
              <h3>Payment Details</h3>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Method:</strong> ${method}</p>
              <p><strong>Status:</strong> Success</p>
            </div>

            <div class="footer">
              <a href="#" class="button">Go to My Courses</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
