export function signupTemplate(username = "User") {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to Our Platform!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
          }
          p {
            font-size: 16px;
            color: #555;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #34a853;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome, ${username}!</h1>
          <p>Thank you for signing up. We’re excited to have you on board!</p>
          <p>To get started, verify your email and explore your dashboard.</p>
          <a href="#" class="button">Verify Email</a>
        </div>
      </body>
    </html>
  `;
}
