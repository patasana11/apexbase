import { NextRequest, NextResponse } from 'next/server';
import { RegistrationService, IRegistrationData } from '@/lib/gsb/services/registration.service';

export async function POST(req: NextRequest) {
  try {
    // Get registration data from request body
    const data: IRegistrationData = await req.json();

    // Initialize registration service
    const registrationService = RegistrationService.getInstance();

    // Register the user
    const registration = await registrationService.registerUser(data);

    if (!registration) {
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      );
    }

    // Generate a validation code and send email verification
    // In a real implementation, this would send an email with the code
    const validationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Return success with the registration ID
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      registrationId: registration.id,
      email: registration.email,
      // Normally we wouldn't return the validation code directly
      // This is just for demonstration purposes
      validationCode
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Get the query params
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  if (!email || !code) {
    return NextResponse.json(
      { error: 'Email and verification code are required' },
      { status: 400 }
    );
  }

  try {
    // Initialize registration service
    const registrationService = RegistrationService.getInstance();

    // Verify the email
    const verified = await registrationService.verifyUserEmail(email, code);

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during email verification' },
      { status: 500 }
    );
  }
}
