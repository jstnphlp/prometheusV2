export type LibraryBook = {
  id: "furniture" | "hardware" | "nail-salon" | "features";
  title: string;
  category: string;
  modelUrl: string;
  anchor: string;
  root: string;
};

const SOURCE_REVISION = "80ab4f3f46c25957eb3a439158d9d5468b717f67";
const SOURCE_ROOT =
  "https://raw.githubusercontent.com/PaulEscobia13/prometheus-library-prototype/" +
  SOURCE_REVISION +
  "/public/library";

export const prometheusLibrary = {
  title: "The Prometheus Library",
  eyebrow: "Projects & features",
  introduction:
    "A collection of partnerships and possibilities. Choose a volume to explore.",
  environmentUrl: `${SOURCE_ROOT}/library-environment.glb`,
  sourceRevision: SOURCE_REVISION,
  books: [
    {
      id: "furniture",
      title: "Furniture Operations",
      category: "Partnered project",
      modelUrl: `${SOURCE_ROOT}/books/project-furniture.glb`,
      anchor: "Anchor_Project_Furniture",
      root: "Project_Furniture_ROOT",
    },
    {
      id: "hardware",
      title: "Hardware Store",
      category: "Partnered project",
      modelUrl: `${SOURCE_ROOT}/books/project-hardware.glb`,
      anchor: "Anchor_Project_Hardware",
      root: "Project_Hardware_ROOT",
    },
    {
      id: "nail-salon",
      title: "Nail Salon",
      category: "Partnered project",
      modelUrl: `${SOURCE_ROOT}/books/project-nail-salon.glb`,
      anchor: "Anchor_Project_NailSalon",
      root: "Project_NailSalon_ROOT",
    },
    {
      id: "features",
      title: "Features",
      category: "The collection",
      modelUrl: `${SOURCE_ROOT}/books/features.glb`,
      anchor: "Anchor_Features",
      root: "Features_Book_ROOT",
    },
  ] satisfies readonly LibraryBook[],
} as const;
