import { LANDMARKS } from "@/lib/landmarks";
import { Home } from "@/components/Home";

export default function Page() {
  return <Home landmarks={LANDMARKS} />;
}
