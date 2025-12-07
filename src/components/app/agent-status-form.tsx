"use client";

import { ReactNode, ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

interface SubmitButtonProps extends ButtonProps {
  children: ReactNode;
  pendingLabel?: string;
}

function SubmitButton({ children, pendingLabel, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} disabled={pending || props.disabled}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}

interface AgentStatusFormProps {
  action: () => Promise<void>;
  label: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function AgentStatusForm({
  action,
  label,
  pendingLabel,
  variant = "default",
  icon,
}: AgentStatusFormProps) {
  return (
    <form action={action}>
      <SubmitButton
        variant={variant}
        size="sm"
        className="h-8 text-[12px]"
        pendingLabel={pendingLabel}
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </SubmitButton>
    </form>
  );
}

