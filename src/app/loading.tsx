import { GlobalSpinner } from "@/components/GlobalSpinner";

export default function GlobalLoading() {
  // We pass isLoading={true} because Next.js only renders this file when it is actually loading a route
  return <GlobalSpinner isLoading={true} text="Loading ASCON Coop..." />;
}
