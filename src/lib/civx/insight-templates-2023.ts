import type { RelativePressureClass2023 } from "./cohort-comparison-2023.ts";

export type InsightTemplateKey2023 =
  | "overall_profile"
  | "main_pressure"
  | "relative_strength"
  | "standout_indicator";

export interface InsightTemplateFacts2023 {
  readonly templateKey: InsightTemplateKey2023;
  readonly classification: RelativePressureClass2023;
  readonly dimensionIds: readonly string[];
  readonly indicatorIds: readonly string[];
}

// Presentation dictionaries are separate from numerical selection. Another locale can
// implement this renderer without changing comparisons, evidence or prioritization.
const dimensionNames: Readonly<Record<string, string>> = {
  socioeconomic: "sosial ekonomi",
  education: "pendidikan",
  basic_services: "layanan dasar",
  public_health: "kesehatan publik",
  disaster_pressure: "tekanan bencana",
  environment: "tekanan kualitas lingkungan",
};
const indicatorNames: Readonly<Record<string, string>> = {
  poverty: "persentase penduduk miskin",
  unemployment: "tingkat pengangguran terbuka",
  gini_ratio: "ketimpangan pengeluaran (Gini)",
  expenditure_per_capita: "pengeluaran riil tahunan per kapita yang disesuaikan",
  rls: "rata-rata lama sekolah penduduk usia 25 tahun ke atas",
  hls: "harapan lama sekolah mulai usia 7 tahun",
  apm: "partisipasi murni pendidikan menengah atas",
  sanitation: "akses rumah tangga ke sanitasi layak",
  drinking_water: "akses rumah tangga ke sumber air minum layak",
  puskesmas_per_100k: "ketersediaan Puskesmas per 100.000 penduduk",
  "household-floor-per-capita-le7-2": "rumah tangga dengan luas lantai paling banyak 7,2 m² per orang",
  health_insurance_ownership: "kepemilikan jaminan kesehatan",
  nutrition_ski2023_stunting: "stunting pada anak usia 0–59 bulan",
  nutrition_ski2023_wasting: "wasting pada anak usia 0–59 bulan",
  morbidity_activity_limiting: "keluhan kesehatan yang mengganggu kegiatan",
  life_expectancy_lfsp2020: "umur harapan hidup saat lahir berbasis LFSP2020",
  irbi_overall_2023: "IRBI 2023",
  iklh_2023: "IKLH 2023",
};
const profilePhrases: Readonly<Record<RelativePressureClass2023, string>> = {
  relatively_low: "relatif rendah",
  lower_middle: "berada pada kelompok menengah bawah",
  middle: "berada di sekitar tengah kelompok pembanding",
  higher_middle: "berada pada kelompok menengah atas",
  relatively_high: "relatif tinggi",
};

function names(ids: readonly string[], dictionary: Readonly<Record<string, string>>): string {
  const labels = ids.map((id) => {
    const label = dictionary[id];
    if (label === undefined) throw new Error(`CIVX insights 2023: unknown template identifier ${id}`);
    return label;
  });
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} dan ${labels[labels.length - 1]}`;
}

export function renderInsightIndonesian2023(facts: InsightTemplateFacts2023): { title: string; message: string } {
  const dimensions = names(facts.dimensionIds, dimensionNames);
  const indicators = names(facts.indicatorIds, indicatorNames);
  switch (facts.templateKey) {
    case "overall_profile":
      return {
        title: "Profil tekanan CIVX relatif",
        message: `Tekanan CIVX wilayah ini ${profilePhrases[facts.classification]} dalam kelompok 27 kabupaten/kota Jawa Barat 2023. Posisi ini bukan penilaian mutlak kualitas hidup.`,
      };
    case "main_pressure": {
      const singletonNotes: string[] = [];
      if (facts.dimensionIds.includes("disaster_pressure")) {
        singletonNotes.push("Dimensi tekanan bencana memakai IRBI sebagai satu-satunya indikator: risiko bencana yang dimodelkan, bukan catatan dampak bencana 2023.");
      }
      if (facts.dimensionIds.includes("environment")) {
        singletonNotes.push("Dimensi tekanan kualitas lingkungan memakai IKLH sebagai satu-satunya indikator: ringkasan kualitas lingkungan, bukan ukuran paparan polusi setiap penduduk.");
      }
      return {
        title: `Dimensi yang menonjol: ${dimensions}`,
        message: [`Dimensi ${dimensions} menonjol dalam profil wilayah ini, dengan tekanan pada kelompok menengah atas atau relatif tinggi dalam kelompok Jawa Barat 2023.`, ...singletonNotes].join(" "),
      };
    }
    case "relative_strength":
      return {
        title: `Tekanan lebih rendah: ${dimensions}`,
        message: `Dimensi ${dimensions} menunjukkan tekanan relatif lebih rendah dalam kelompok pembanding dan dibandingkan dimensi lain di wilayah ini. Tekanan lebih rendah tidak berarti tanpa masalah.`,
      };
    case "standout_indicator":
      return {
        title: `Indikator yang menonjol dalam ${dimensions}`,
        message: `Indikator ${indicators} menunjukkan tekanan relatif tinggi dibandingkan indikator yang sama di wilayah lain dalam kelompok Jawa Barat 2023. Indikator ini termasuk penyumbang poin terbesar pada dimensi ${dimensions} di wilayah ini; kontribusi pada skor model bukan penjelasan sebab-akibat.`,
      };
  }
}
