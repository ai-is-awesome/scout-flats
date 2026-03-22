import { Button } from "@/components/ui/button";
import { ZoloCombinedCenterSearchAndPricingType } from "@property-search/shared-types";
import { useState } from "react";

type Props = {
  data: ZoloCombinedCenterSearchAndPricingType[] | null;
};

function getPricingShape(data: ZoloCombinedCenterSearchAndPricingType[]) {
  const pricingShape = [];
  for (const center of data ?? []) {
    const pricing = center.detailed_pricing_info;
    for (const pricingType of pricing) {
      const variantsLen = pricingType.variants?.length;
      const roomVariantTypeLen = pricingType.roomVariantTypeList?.length;
      pricingShape.push({
        name: center.basicData.name,
        variantsLen,
        roomVariantTypeLen,
      });
    }
  }
  return pricingShape;
}

export const JsonAnalytics = ({ data }: Props) => {
  const pricingShape = getPricingShape(data ?? []);
  const inconsistent = pricingShape.filter(
    (item) => item.roomVariantTypeLen !== item.variantsLen
  );
  const [showAll, setShowAll] = useState(false);
  return (
    <div>
      <h1>Pricing Shape</h1>
      <Button
        onClick={() => setShowAll(false)}
        className={!showAll ? "bg-gray-900" : "bg-gray-200"}
      >
        Unequal room variant and variants
      </Button>
      <Button
        onClick={() => setShowAll(true)}
        className={showAll ? "bg-gray-900" : "bg-gray-200"}
      >
        Show all
      </Button>

      <>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Variants Length</th>
              <th>Room Variant Type Length</th>
            </tr>
          </thead>
          <tbody>
            {showAll
              ? inconsistent.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.variantsLen}</td>
                    <td>{item.roomVariantTypeLen}</td>
                  </tr>
                ))
              : pricingShape.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.variantsLen}</td>
                    <td>{item.roomVariantTypeLen}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </>
    </div>
  );
};
