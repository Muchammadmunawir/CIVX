import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { themeBootScript } from "@/components/layout/theme";
import { Notice } from "@/components/product/product-ui";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-civx",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CIVX · Jawa Barat",
    template: "%s · CIVX",
  },
  description: "Tekanan relatif 27 kabupaten/kota Jawa Barat dalam model CIVX 2023. Telusuri enam dimensi, 18 indikator, dan sumbernya.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning className={poppins.variable}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <a className="civx-skip-link" href="#main-content">Lewati ke konten</a>
        <SiteHeader />
        <aside className="civx-container" aria-label="Status pratinjau">
          <Notice>
            <strong>Pratinjau untuk peninjauan.</strong> Skor dan insight CIVX 2023 belum disetujui untuk rilis publik.
            {" "}<Link className="civx-text-link" href="/methodology#status-model">Baca status model dan batas penggunaan.</Link>
          </Notice>
        </aside>
        <div id="main-content" tabIndex={-1}>{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
