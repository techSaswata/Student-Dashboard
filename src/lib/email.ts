interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html } = options

  const resendApiKey = process.env.RESEND_API_KEY

  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'MentiBY <onboarding@resend.dev>'

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: Array.isArray(to) ? to : [to],
          subject,
          html
        })
      })

      const responseData = await response.json().catch(() => ({}))
      console.log('Resend response:', response.status, JSON.stringify(responseData))

      if (!response.ok) {
        console.error('Resend error:', responseData)
        return false
      }

      return true
    } catch (error) {
      console.error('Email send error:', error)
      return false
    }
  }

  // Fallback: Log email for testing
  console.log('=== EMAIL (Test Mode) ===')
  console.log('To:', to)
  console.log('Subject:', subject)
  console.log('HTML:', html.substring(0, 200) + '...')
  console.log('========================')

  return true
}
