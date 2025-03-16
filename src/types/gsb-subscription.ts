export class GsbSubscriptionPlan {
    public createDate: Date;
    public lastUpdateDate: Date;
    public nextPaymentDate: Date;
    public id: string;
    public paymentType: PaymentType;
    public lastPaymentDate: Date;
    public lastUpdatedBy: GsbUser;
    public payments: GsbPrtPayment[];
    public creditCard: GsbPrtCreditCard;
    public createdBy: GsbUser;
    public paymentOption: GsbPrtPaymentOption;
    public lastUpdatedBy_id: string;
    public nextPaymentAmount: number;
    public paymentOption_id: string;
    public provisions: GsbProvision[];
    public currency: GsbPrtCurrency;
    public createdBy_id: string;
    public creditCard_id: string;
    public subscriptions: GsbSubscription[];
    public currency_id: string;
    public title: string;
    public startDate: Date;
    public orders: GsbPrtOrder[];
    public tenant: GsbTenant;
    public salesPack: GsbPrtSalesPack;
    public status: SubscriptionPlanStatus;
    public partner_id: string;
    public partner: GsbPrtPartner;
    public tenant_id: string;
    public salesPack_id: string;
}

export enum PaymentType {
    CreditCardOnline = 2,
    CreditCardManuel = 4,
    Cash = 8,
    BankTransfer = 1
}

export enum SubscriptionPlanStatus {
    Active = 1,
    Freezed = 2,
    Cancelled = 4,
    Renewing = 8
}

export class GsbSubscription {
    public plan_id: string;
    public lastPaymentAmount: number;
    public plan: GsbSubscriptionPlan;
    public active: boolean;
    public createDate: Date;
    public title: string;
    public productVariant: GsbPrtProductVariant;
    public lastUpdateDate: Date;
    public usedQuantity: number;
    public provision_id: string;
    public endDate: Date;
    public tenant_id: string;
    public service_id: string;
    public productVariant_id: string;
    public lastPaymentCoverage: number;
    public id: string;
    public quantity: number;
    public provision: GsbProvision;
    public providerCode: string;
    public serviceCode: string;
    public tenant: GsbTenant;
    public startDate: Date;
    public createdBy: GsbUser;
    public lastUpdatedBy: GsbUser;
    public lastPaymentDate: Date;
    public service: GsbService;
    public renewQuantity: number;
    public createdBy_id: string;
    public lastUpdatedBy_id: string;
}

export class GsbPrtPayment {
    public basket_id: string;
    public trigger_id: string;
    public expense: GsbPrtExpense;
    public employee_id: string;
    public subscriptionPlan_id: string;
    public isAuto: boolean;
    public senderLegal_id: string;
    public failOrder: GsbPrtOrder;
    public lastUpdatedBy_id: string;
    public paymentOption: GsbPrtPaymentOption;
    public transactions: GsbPrtTransaction[];
    public registration_id: string;
    public creditCard_id: string;
    public id: string;
    public order_id: string;
    public senderLegal: GsbPrtLegalEntity;
    public direction: TransactionDirection;
    public sessionToken: string;
    public lastUpdatedBy: GsbUser;
    public amount: number;
    public createDate: Date;
    public paymentOption_id: string;
    public invoice: GsbPrtInvoice;
    public order: GsbPrtOrder;
    public message: string;
    public senderPartner_id: string;
    public senderPartner: GsbPrtPartner;
    public receiverPartner_id: string;
    public receiverPartner: GsbPrtPartner;
    public currency_id: string;
    public invoice_id: string;
    public employee: GsbPrtEmployee;
    public tenant_id: string;
    public registration: GsbCmRegistration;
    public title: string;
    public salesPack: GsbPrtSalesPack;
    public lastUpdateDate: Date;
    public salesPack_id: string;
    public creditCard: GsbPrtCreditCard;
    public trackVersion: string;
    public status: PaymentStatus;
    public code: string;
    public failOrder_id: string;
    public currency: GsbPrtCurrency;
    public expense_id: string;
    public receiverLegal: GsbPrtLegalEntity;
    public trigger: GsbProcessTrigger;
    public paymentLogs: GsbPrtPaymentLog[];
    public createdBy_id: string;
    public receiverLegal_id: string;
    public createdBy: GsbUser;
    public basket: GsbPrtBasket;
    public subscriptionPlan: GsbSubscriptionPlan;
    public tenant: GsbTenant;
}

export enum TransactionDirection {
    Incoming = 1,
    None = 4,
    Outgoing = 2
}

export enum PaymentStatus {
    Awaiting = 1,
    Completed = 2,
    Failed = 4,
    Cancelled = 8,
    Refunded = 16
}

export class GsbPrtPaymentLog {
    public createDate: Date;
    public lastUpdatedBy_id: string;
    public lastUpdateDate: Date;
    public payment: GsbPrtPayment;
    public violatorParam: string;
    public order_id: string;
    public createdBy_id: string;
    public response: string;
    public title: string;
    public request: string;
    public id: string;
    public message: string;
    public order: GsbPrtOrder;
    public payment_id: string;
    public status: number;
    public lastUpdatedBy: GsbUser;
    public createdBy: GsbUser;
}

export class GsbCmRegistration {
    public promotion: any;
    public paymentOption: any;
    public paymentOption_id: string;
    public currency: any;
    public verifications: any[];
    public createdBy: any;
    public name: string;
    public paymentToken: string;
    public verification: any;
    public status: number;
    public validationCode: string;
    public verificationKey: string;
    public lastUpdatedBy_id: string;
    public registration: any;
    public subscriptionPlan_id: string;
    public surname: string;
    public verification_id: string;
    public creditCard_id: string;
    public order_id: string;
    public registration_id: string;
    public lastUpdateDate: Date;
    public id: string;
    public currency_id: string;
    public salesPack_id: string;
    public title: string;
    public email: string;
    public payment_id: string;
    public updatedRegistrations: any[];
    public lastUpdatedBy: any;
    public subscriptionPlan: GsbSubscriptionPlan;
    public creditCard: any;
    public tenant: any;
    public savePaymentInfo: boolean;
    public billingType: number;
    public salesPack: any;
    public phoneNumber: string;
    public createdBy_id: string;
    public transferCode: string;
    public tenant_id: string;
    public partner_id: string;
    public emailVerified: boolean;
    public order: any;
    public partner: any;
    public payment: any;
    public provisions: any[];
    public socialToken: string;
    public type: number;
    public password: string;
    public createDate: Date;
    public picture: string;
    public socialProvider: number;
}

// Stubs for referenced types used in the model classes
export class GsbUser {}
export class GsbPrtCreditCard {}
export class GsbPrtPaymentOption {}
export class GsbProvision {}
export class GsbPrtCurrency {}
export class GsbPrtSalesPack {}
export class GsbPrtPartner {}
export class GsbTenant {}
export class GsbPrtProductVariant {}
export class GsbService {}
export class GsbPrtExpense {}
export class GsbPrtOrder {}
export class GsbPrtLegalEntity {}
export class GsbPrtTransaction {}
export class GsbPrtInvoice {}
export class GsbPrtEmployee {}
export class GsbProcessTrigger {}
export class GsbPrtBasket {}
