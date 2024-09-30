import localFont from "next/font/local";
import {
  Inter,
  Lora,
  Work_Sans,
  Open_Sans,
  Playfair_Display,
  Lato,
  Fira_Sans,
  Raleway,
} from "next/font/google";

// export const bricolageGrotesque = Bricolage_Grotesque({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "700"],
// });

export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const cal = localFont({
  src: "./CalSans-SemiBold.otf",
  variable: "--font-cal",
  weight: "600",
  display: "swap",
});

export const calTitle = localFont({
  src: "./CalSans-SemiBold.otf",
  variable: "--font-title",
  weight: "600",
  display: "swap",
});

export const lora = Lora({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

export const work = Work_Sans({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

export const playfair = Playfair_Display({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const lato = Lato({
  subsets: ["latin"],
  weight: "400",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const fontMapper = {
  [cal.className]: "Cal",
  [calTitle.className]: "Cal Title",
  [inter.className]: "Inter",
  [lora.className]: "Lora",
  [work.className]: "Work",
  [playfair.className]: "Playfair",
  [lato.className]: "Lato",
  [openSans.className]: "Open Sans",
  [fira.className]: "Fira Sans",
  [raleway.className]: "Raleway",
} as Record<string, string>;
