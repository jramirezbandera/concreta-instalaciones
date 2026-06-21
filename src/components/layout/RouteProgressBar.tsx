import { useNavigation } from "react-router";

/** Thin top progress bar shown while a lazy route chunk is loading. */
export function RouteProgressBar() {
  const navigation = useNavigation();
  if (navigation.state === "idle") return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden" aria-hidden="true">
      <div
        className="animate-route-progress h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
          backgroundSize: "40% 100%",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
