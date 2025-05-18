
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const QRCodeDetailsSkeleton = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-28 w-28 mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
};

export const StatsSummaryCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
};

export const DetailedStatsSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <ChartSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
};
