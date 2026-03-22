"use client";

import type {
  ZoloCombinedCenterSearchAndPricingType,
  ZoloRoomPricingApiObject,
} from "@property-search/shared-types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useMemo, useState } from "react";
import { DetailModal } from "./detail-modal";

type JsonEntriesProps = {
  data: ZoloCombinedCenterSearchAndPricingType[] | null;
};

const BASIC_FIELDS = [
  "name",
  "zoloCode",
  "id",
  "addressLine1",
  "addressLine2",
  "locality",
  "city",
  "propertyCategory",
  "propertyState",
  "averageRating",
  "minRent",
  "maxRent",
  "gender",
] as const;

export function JsonEntries({ data }: JsonEntriesProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [modal, setModal] = useState<{ title: string; data: unknown } | null>(
    null
  );

  const propertyOptions = useMemo(() => {
    if (!data?.length) return [];
    return data.map((p, i) => ({
      value: i,
      label: `${p.basicData.name || p.basicData.zoloCode} (${
        p.basicData.zoloCode
      })`,
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="mt-4 text-muted-foreground">No properties found</div>
    );
  }

  const safeIndex =
    selectedIndex >= 0 && selectedIndex < data.length ? selectedIndex : 0;
  const property = data[safeIndex];
  const { basicData, images, detailed_pricing_info } = property;

  data.filter((p) => p.detailed_pricing_info.filter((item) => item.roomTypes));

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="property-searchable-select"
          className="mb-1 block text-sm font-medium"
        >
          Select property
        </label>
        <SearchableSelect<number>
          options={propertyOptions}
          value={safeIndex}
          onValueChange={(v) => {
            if (v != null) setSelectedIndex(v);
          }}
          placeholder="Search by name or zolo code..."
          emptyMessage="No properties match your search"
          className="max-w-md"
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">Field</th>
              <th className="px-4 py-2 text-left font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {BASIC_FIELDS.map((field) => {
              const val = basicData[field as keyof typeof basicData];
              if (val == null || val === "") return null;
              return (
                <tr key={field} className="border-b">
                  <td className="px-4 py-2 font-medium">{field}</td>
                  <td className="px-4 py-2">{String(val)}</td>
                </tr>
              );
            })}

            <tr className="border-b">
              <td className="px-4 py-2 font-medium">description</td>
              <td className="max-w-md truncate px-4 py-2">
                {basicData.description || "—"}
              </td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-2 font-medium">images</td>
              <td className="px-4 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setModal({
                      title: "Images",
                      data: images,
                    })
                  }
                  className="text-primary hover:underline"
                >
                  {images?.length ?? 0} image(s) — click to view
                </button>
              </td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-2 font-medium">detailed_pricing_info</td>
              <td className="px-4 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setModal({
                      title: "Pricing details",
                      data: detailed_pricing_info,
                    })
                  }
                  className="text-primary hover:underline"
                >
                  {detailed_pricing_info?.length ?? 0} room type(s) — click to
                  view
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Per-room-type rows: show a summary row for each pricing item, clickable to expand */}
      <div className="mt-4">
        <h4 className="mb-2 font-medium">Room types</h4>
        <div className="space-y-1">
          {(detailed_pricing_info ?? []).map(
            (item: ZoloRoomPricingApiObject, i: number) => (
              <div
                key={`${item.sharingType}-${i}`}
                className="flex items-center gap-4 rounded border px-3 py-2"
              >
                <span className="font-medium">{item.sharingType}</span>
                <span className="text-muted-foreground">
                  min ₹{item.minRent?.toLocaleString()} ·{" "}
                  {item.variants?.length ?? 0} variant(s)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setModal({
                      title: `${item.sharingType} — full details`,
                      data: item,
                    })
                  }
                  className="ml-auto text-sm text-primary hover:underline"
                >
                  View details
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {modal && (
        <DetailModal
          title={modal.title}
          data={modal.data}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
