"use client";

import {
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import LoadingSpinner from "./loading-spinner";
import { useDomainStatus } from "./use-domain-status";

export default function DomainStatus({ domain }: { domain: string }) {
  const { status, loading } = useDomainStatus({ domain });

  return loading ? (
    <LoadingSpinner />
  ) : status === "Valid Configuration" ? (
    <CheckCircledIcon
      fill="#2563EB"
      stroke="currentColor"
      className="text-white dark:text-black"
    />
  ) : status === "Pending Verification" ? (
    <InfoCircledIcon
      fill="#FBBF24"
      stroke="currentColor"
      className="text-white dark:text-black"
    />
  ) : (
    <CrossCircledIcon
      fill="#DC2626"
      stroke="currentColor"
      className="text-white dark:text-black"
    />
  );
}
