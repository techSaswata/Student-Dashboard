// Auth service for sending magic links with student verification

export interface StudentUser {
  id: string
  email: string
  enrollmentId?: string
  name?: string
  cohortType?: string
  cohortNumber?: string
}

interface SendMagicLinkResponse {
  success: boolean
  message: string
  studentName: string
  error?: string
}

interface SendMagicLinkParams {
  email: string
  cohortType: string
  cohortNumber: string
}

export const authService = {
  // Send magic link to student email after verification
  async sendMagicLink(params: SendMagicLinkParams): Promise<{ 
    data: SendMagicLinkResponse | null
    error: string | null
  }> {
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      const data = await response.json()

      if (!response.ok) {
        return { 
          data: null, 
          error: data.error || 'Failed to send verification link'
        }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message || 'Network error' }
    }
  }
}
