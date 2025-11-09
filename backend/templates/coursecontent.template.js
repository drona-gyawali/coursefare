export function courseContentTemplate(courseTitle, contentTitle, courseLink, contentType, type) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Course ${type} Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
        <tr>
            <td style="background-color: #4F46E5; color: white; text-align: center; padding: 16px 0; font-size: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            Course Content ${type}!
            </td>
        </tr>

        <tr>
            <td style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Hi there 👋,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.5;">
                We’ve just ${type}  content to your purchased course:
            </p>

            <div style="background-color: #f3f4f6; border-left: 4px solid #4F46E5; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 0; font-weight: bold; color: #111;">${courseTitle}</p>
                <p style="margin: 4px 0 0 0; color: #555;">${contentTitle} — ${contentType}</p>
            </div>

            <p style="font-size: 15px; color: #555;">
                You can check out the new section by visiting your course dashboard.
            </p>

            <a href="${courseLink}" 
                style="display: inline-block; background-color: #4F46E5; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold;">
                View Course
            </a>

            <p style="font-size: 13px; color: #777; margin-top: 20px;">
                Thanks for learning with us!<br>
                <b>The Course Platform Team</b>
            </p>
            </td>
        </tr>
        </table>
    </body>
    </html>
    `;
}
