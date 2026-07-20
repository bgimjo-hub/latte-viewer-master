import SlideViewer from "@/components/SlideViewer";
import { slides } from "@/data/slides";

export default function CatalogPage() {
  return <SlideViewer slides={slides} />;
}
