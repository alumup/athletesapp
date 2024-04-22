import { ReadonlyURLSearchParams } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const response = await fetch(input, { ...init, cache: "no-store" });

  return response.json();
}

export const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const truncate = (str: string, num: number) => {
  if (!str) return "";
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};

export const getBlurDataURL = async (url: string | null) => {
  if (!url) {
    return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  }
  try {
    const response = await fetch(
      `https://wsrv.nl/?url=${url}&w=50&h=50&blur=5`,
    );
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  }
};

export const placeholderBlurhash =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAoJJREFUWEfFl4lu4zAMRO3cx/9/au6reMaOdkxTTl0grQFCRoqaT+SQotq2bV9N8rRt28xms87m83l553eZ/9vr9Wpkz+ezkT0ej+6dv1X81AFw7M4FBACPVn2c1Z3zLgDeJwHgeLFYdAARYioAEAKJEG2WAjl3gCwNYymQQ9b7/V4spmIAwO6Wy2VnAMikBWlDURBELf8CuN1uHQSrPwMAHK5WqwFELQ01AIXdAa7XawfAb3p6AOwK5+v1ugAoEq4FRSFLgavfQ49jAGQpAE5wjgGCeRrGdBArwHOPcwFcLpcGU1X0IsBuN5tNgYhaiFFwHTiAwq8I+O5xfj6fOz38K+X/fYAdb7fbAgFAjIJ6Aav3AYlQ6nfnDoDz0+lUxNiLALvf7XaDNGQ6GANQBKR85V27B4D3QQRw7hGIYlQKWGM79hSweyCUe1blXhEAogfABwHAXAcqSYkxCtHLUK3XBajSc4Dj8dilAeiSAgD2+30BAEKV4GKcAuDqB4TdYwBgPQByCgApUBoE4EJUGvxUjF3Q69/zLw3g/HA45ABKgdIQu+JPIyDnisCfAxAFNFM0EFNQ64gfS0EUoQP8ighrZSjn3oziZEQpauyKbfjbZchHUL/3AS/Dd30gAkxuRACgfO+EWQW8qwI1o+wseNuKcQiESjALvwNoMI0TcRzD4lFcPYwIM+JTF5x6HOs8yI7jeB5oKhpMRFH9UwaSCDB2Jmg4rc6E2TT0biIaG0rQhNqyhpHBcayTTSXH6vcDL7/sdqRK8LkwTsU499E8vRcAojHcZ4AxABdilgrp4lsXk8oVqgwh7+6H3phqd8J0Kk4vbx/+sZqCD/vNLya/5dT9fAH8g1WdNGgwbQAAAABJRU5ErkJggg==";

export const toDateString = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const fullName = (person: any) => {
  return `${person?.first_name} ${person?.last_name}`;
};

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams,
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;

export const getSiteDomain = (url: string) => {
  const domainMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
  if (domainMatch) {
    const domain = domainMatch[1];
    if (typeof domain === "string") {
      if (domain.startsWith("www.")) {
        return domain.slice(4); // Exclude 'www'
      }
      return domain;
    }
  }
  return null;
};

export const isSubdomain = (url: string) => {
  const domainMatch = url.match(/^(?:https?:\/\/)?(?:[^\.]+\.)?([^\/]+)/i);
  if (domainMatch) {
    const domain = domainMatch[1];
    if (typeof domain === "string") {
      const parts = domain.split(".");
      if (parts.length > 2 && parts[0] !== "www") {
        return true; // It's a subdomain if it's not 'www'
      }
    }
  }
  return false;
};

export const isValidHost = (host: string) => {
  const hostRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return hostRegex.test(host);
};

export const getDomainQuery = (domain: string) => {
  let decodedDomain = decodeURIComponent(domain).replace(
    `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
    "",
  );

  if (decodedDomain.startsWith("www.")) {
    decodedDomain = decodedDomain.substring(4);
  }

  let subdomain = null;

  if (!isValidHost(decodedDomain)) {
    subdomain = decodedDomain.replace(
      `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
      "",
    );
  }
  return [subdomain ? "subdomain" : "domain", subdomain || domain];
};

export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const lastPart = parts.pop();
    if (lastPart) {
      const splitParts = lastPart.split(";");
      if (splitParts.length > 0) {
        return splitParts.shift();
      }
    }
  }
}

export function getInitials(firstName: string, lastName: string) {
  if (!firstName || !lastName) {
    return "UN";
  }

  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  return firstInitial + lastInitial;
}

export function formatDate(date: string) {
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const monthsOfYear = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const currentDate = new Date(date);

  const dayOfWeek = daysOfWeek[currentDate.getDay()] || "";
  const dateOfMonth = currentDate.getDate() || "";
  const monthOfYear = monthsOfYear[currentDate.getMonth()] || "";

  const formattedDate = `${dateOfMonth}\n ${monthOfYear}`;
  return formattedDate;
}

export function formatDay(date: string) {
  const currentDate = new Date(date);
  const dateOfMonth = currentDate.getDate() || "";

  const formattedDate = `${dateOfMonth}`;
  return formattedDate;
}

export function formatMonth(date: string) {
  const monthsOfYear = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const currentDate = new Date(date);

  const monthOfYear = monthsOfYear[currentDate.getMonth()] || "";

  const formattedDate = `${monthOfYear}`;
  return formattedDate;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  // Parse start time
  const startHour = parseInt(startTime?.slice(0, 2), 10);
  const startMinute = parseInt(startTime?.slice(3, 5), 10);
  const formattedStartHour = startHour % 12 === 0 ? 12 : startHour % 12;
  const startSuffix = startHour >= 12 ? "PM" : "AM";
  const formattedStartTime = `${formattedStartHour}:${startMinute
    .toString()
    .padStart(2, "0")} ${startSuffix}`;

  // Parse end time
  const endHour = parseInt(endTime.slice(0, 2), 10);
  const endMinute = parseInt(endTime.slice(3, 5), 10);
  const formattedEndHour = endHour % 12 === 0 ? 12 : endHour % 12;
  const endSuffix = endHour >= 12 ? "PM" : "AM";
  const formattedEndTime = `${formattedEndHour}:${endMinute
    .toString()
    .padStart(2, "0")} ${endSuffix}`;

  // Concatenate and return the time range
  return `${formattedStartTime} - ${formattedEndTime}`;
}

export function formatStartTime(startTime: string): string {
  // Parse start time
  const startHour = parseInt(startTime?.slice(0, 2), 10);
  const startMinute = parseInt(startTime?.slice(3, 5), 10);
  const formattedStartHour = startHour % 12 === 0 ? 12 : startHour % 12;
  const startSuffix = startHour >= 12 ? "PM" : "AM";
  const formattedStartTime = `${formattedStartHour}:${startMinute
    .toString()
    .padStart(2, "0")} ${startSuffix}`;

  // Concatenate and return the time range
  return `${formattedStartTime}`;
}
