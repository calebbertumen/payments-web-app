import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, comment } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !comment) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Send email using Resend
    // Note: You'll need to install Resend and set up RESEND_API_KEY in your environment variables
    // npm install resend
    
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    
    if (!RESEND_API_KEY) {
      // Fallback: Log the contact form submission if Resend is not configured
      console.log("Contact Form Submission:", {
        from: `${firstName} ${lastName} <${email}>`,
        to: "calebbertumen99@gmail.com",
        subject: "New Contact Form Submission",
        message: comment,
      })
      
      // Return success even without email service (for development)
      return NextResponse.json({
        success: true,
        message: "Contact form submitted. Email service not configured.",
      })
    }

    // If Resend is configured, send the email
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Payments Contact Form <onboarding@resend.dev>", // You can customize this domain
        to: "calebbertumen99@gmail.com",
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>User ID:</strong> ${session.user.id}</p>
          <hr>
          <h3>Message:</h3>
          <p>${comment.replace(/\n/g, "<br>")}</p>
        `,
        reply_to: email,
      }),
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.json()
      console.error("Resend API error:", error)
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
    })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

