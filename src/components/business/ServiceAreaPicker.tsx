"use client";

import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { ServiceAreaPlace } from "@/lib/types/owner";
import { MapPin, Plus, X } from "lucide-react";

type Props = {
  value: ServiceAreaPlace[];
  onChange: (next: SetStateAction<ServiceAreaPlace[]>) => void;
};

export function ServiceAreaPicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setLoadError("Google Maps is not configured.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setOptions({ key });
        await importLibrary("places") as google.maps.PlacesLibrary;
        if (cancelled || !inputRef.current) return;
        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["place_id", "formatted_address", "geometry", "name"],
          types: ["(regions)"],
        });

        ac.addListener("place_changed", () => {
          const p = ac.getPlace();
          const placeId = p.place_id;
          const loc = p.geometry?.location;
          if (!placeId || !loc) return;
          const label = p.formatted_address ?? p.name ?? "Area";
          const next: ServiceAreaPlace = {
            placeId,
            label,
            lat: loc.lat(),
            lng: loc.lng(),
          };

          onChange((prev) => {
            if (prev.some((v) => v.placeId === next.placeId)) {
              return prev;
            }
            return [...prev, next];
          });
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        });
        setReady(true);
      } catch {
        setLoadError("Could not load Google Maps.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onChange]);

  const addManualArea = useCallback(() => {
    const input = inputRef.current;

    if (!input) return;

    const label = input.value.trim();

    if (!label) return;

    const placeId = `manual-${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;

    const next: ServiceAreaPlace = {
      placeId,
      label,
      lat: 0,
      lng: 0,
    };

    onChange((prev) => {
      if (
        prev.some(
          (v) => v.placeId === next.placeId || v.label.toLowerCase() === label.toLowerCase()
        )
      ) {
        return prev;
      }

      return [...prev, next];
    });

    input.value = "";
  }, [onChange]);

  const remove = useCallback(
    (placeId: string) => {
      onChange(value.filter((v) => v.placeId !== placeId));
    },
    [onChange, value]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        Service areas
      </label>

      <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
        <MapPin size={16} className="text-gray-400" />

        <input
          ref={inputRef}
          disabled={!ready && !loadError}
          onKeyDown={(event) => {
            if (event.key === "Enter" && loadError) {
              event.preventDefault();
              addManualArea();
            }
          }}
          placeholder={
            loadError
              ? "Enter city, locality, or service area"
              : "Search city, locality, or pincode…"
          }
          className="min-w-[200px] flex-1 border-0 bg-transparent text-sm outline-none"
        />

        {loadError ? (
          <button
            type="button"
            onClick={addManualArea}
            className="rounded-md bg-[#1a2d5c] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#14234a]"
          >
            Add
          </button>
        ) : (
          ready && <Plus size={16} className="text-gray-400" aria-hidden />
        )}
      </div>

      {loadError && (
        <p className="text-xs text-amber-700">
          Google Maps is unavailable. You can add service areas manually.
        </p>
      )}

      <ul className="flex flex-wrap gap-2">
        {value.map((a) => (
          <li
            key={a.placeId}
            className="inline-flex items-center gap-1 rounded-full bg-[#1a2d5c]/10 px-3 py-1 text-xs font-semibold text-[#1a2d5c]"
          >
            {a.label}

            <button
              type="button"
              onClick={() => remove(a.placeId)}
              className="rounded-full p-0.5 hover:bg-black/10"
              aria-label={`Remove ${a.label}`}
            >
              <X size={12} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}