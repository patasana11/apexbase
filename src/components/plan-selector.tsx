'use client';

import React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionPlan } from '@/lib/gsb/services/subscription/paddle.service';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlanSelectorProps {
  plans: SubscriptionPlan[];
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
  billing?: 'monthly' | 'yearly';
  onBillingChange?: (billing: 'monthly' | 'yearly') => void;
  disabled?: boolean;
  className?: string;
}

export function PlanSelector({
  plans,
  selectedPlan,
  onPlanSelect,
  billing = 'monthly',
  onBillingChange,
  disabled = false,
  className,
}: PlanSelectorProps) {
  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {onBillingChange && (
        <Tabs
          value={billing}
          onValueChange={(value) => onBillingChange(value as 'monthly' | 'yearly')}
          className="mb-6 w-[400px] mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly" disabled={disabled}>
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" disabled={disabled}>
              Yearly <span className="ml-1 text-xs font-normal">Save 20%</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'relative rounded-lg border p-6 shadow-sm transition-all cursor-pointer',
              selectedPlan === plan.id
                ? 'border-2 border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-foreground/20'
            )}
            onClick={() => !disabled && onPlanSelect(plan.id)}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Popular
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <h3 className="font-medium">{plan.name}</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{plan.priceDisplay}</span>
                {plan.interval && (
                  <span className="ml-1 text-sm text-muted-foreground">
                    /{plan.interval}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <div className="mt-4 flex flex-col space-y-2">
              <div className="text-xs font-medium uppercase text-muted-foreground">
                What's included
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              type="button"
              variant={selectedPlan === plan.id ? "default" : "outline"}
              className="mt-6 w-full"
              onClick={() => !disabled && onPlanSelect(plan.id)}
              disabled={disabled}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select plan'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
