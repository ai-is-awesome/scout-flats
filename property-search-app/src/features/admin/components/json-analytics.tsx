import { ZoloCombinedCenterSearchAndPricingType } from "@property-search/shared-types";

type Props = {
  data: ZoloCombinedCenterSearchAndPricingType[] | null;
};

export const JsonAnalytics = ({ data }: Props) => {
  // data?.filter(center => center.detailed_pricing_info.map())
  return <div>JsonAnalytics</div>;
};
