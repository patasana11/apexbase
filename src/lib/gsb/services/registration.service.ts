'use client';

import { GsbCmRegistration } from '@/types/gsb-subscription';
import { SubscriptionService } from './subscription/subscription.service';

export enum RegistrationType {
  Free = 1,
  Basic = 2,
  Premium = 4,
  Enterprise = 8,
  Social = 16
}

export enum SocialProvider {
  None = 0,
  Google = 1,
  Github = 2,
  Facebook = 4
}

export interface IRegistrationData {
  email: string;
  password?: string;
  name: string;
  surname: string;
  phoneNumber?: string;
  subscriptionType: RegistrationType;
  paymentInfo?: {
    token?: string;
    saveInfo?: boolean;
  }
  socialInfo?: {
    provider: SocialProvider;
    token: string;
  }
}

/**
 * Registration service for handling user registration
 */
export class RegistrationService {
  private static instance: RegistrationService;
  private subscriptionService: SubscriptionService;

  private constructor() {
    this.subscriptionService = SubscriptionService.getInstance();
  }

  public static getInstance(): RegistrationService {
    if (!RegistrationService.instance) {
      RegistrationService.instance = new RegistrationService();
    }
    return RegistrationService.instance;
  }

  /**
   * Register a new user
   */
  public async registerUser(data: IRegistrationData): Promise<GsbCmRegistration> {
    console.log('Registering user with data:', data);

    // Create a registration object
    const registration: Partial<GsbCmRegistration> = {
      name: data.name,
      surname: data.surname,
      email: data.email,
      phoneNumber: data.phoneNumber,
      type: data.subscriptionType,
      emailVerified: false,
      createDate: new Date(),
      lastUpdateDate: new Date(),
      // Set social login information if available
      socialProvider: data.socialInfo?.provider || SocialProvider.None,
      socialToken: data.socialInfo?.token,
      // Set password only if not using social login
      password: data.socialInfo ? undefined : data.password,
      paymentToken: data.paymentInfo?.token,
      savePaymentInfo: data.paymentInfo?.saveInfo || false,
    };

    // For now, return the mock registration
    // In a real implementation, this would make API calls to GSB
    return registration as GsbCmRegistration;
  }

  /**
   * Verify user email with validation code
   */
  public async verifyUserEmail(email: string, validationCode: string): Promise<boolean> {
    console.log(`Verifying email ${email} with code ${validationCode}`);
    // In a real implementation, this would make API calls to GSB
    // For now, just simulate success
    return true;
  }

  /**
   * Complete user registration and set up subscription if needed
   */
  public async completeRegistration(
    registrationId: string,
    verificationKey: string,
    subscriptionData?: any
  ): Promise<{
    success: boolean;
    userId?: string;
    tenantId?: string;
    subscriptionPlanId?: string;
  }> {
    console.log(`Completing registration ${registrationId} with key ${verificationKey}`);

    // In a real implementation, we would:
    // 1. Verify the registration exists and is valid
    // 2. Create the user account
    // 3. Set up the subscription if needed
    // 4. Update the registration status

    // For now, simulate a successful registration
    const mockUserId = 'user_' + Math.random().toString(36).substr(2, 9);
    const mockTenantId = 'tenant_' + Math.random().toString(36).substr(2, 9);

    let mockSubscriptionPlanId: string | undefined;

    // Set up subscription for paid plans
    if (subscriptionData && subscriptionData.planType !== RegistrationType.Free) {
      const mockPlan = await this.subscriptionService.createSubscriptionPlan(
        mockUserId,
        mockTenantId,
        `${subscriptionData.planType === RegistrationType.Premium ? 'Premium' : 'Basic'} Plan`
      );

      mockSubscriptionPlanId = mockPlan.id;
    }

    return {
      success: true,
      userId: mockUserId,
      tenantId: mockTenantId,
      subscriptionPlanId: mockSubscriptionPlanId
    };
  }

  /**
   * Process a social login based registration
   */
  public async processSocialRegistration(provider: SocialProvider, token: string, userData: any): Promise<{
    success: boolean;
    isNewUser: boolean;
    userId?: string;
    registrationId?: string;
  }> {
    console.log(`Processing social registration with provider ${provider} and token ${token}`);

    // In a real implementation, we would:
    // 1. Verify the social token with the provider
    // 2. Check if the user already exists
    // 3. Create a new registration if needed

    // For now, simulate a successful registration
    const mockUserId = 'user_' + Math.random().toString(36).substr(2, 9);
    const mockRegistrationId = 'reg_' + Math.random().toString(36).substr(2, 9);

    // Simulate a new user
    const isNewUser = true;

    return {
      success: true,
      isNewUser,
      userId: mockUserId,
      registrationId: mockRegistrationId
    };
  }
}
